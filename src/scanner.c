#include <assert.h>
#include <stdio.h>
#include <string.h>
#include <tree_sitter/parser.h>

enum TokenType { OpenBrace, CloseBrace, Semicolon, RawString };

struct layout_stack_entry {
  int indent_length;
  struct layout_stack_entry *below;
};

struct scanner {
  struct layout_stack_entry *layout_stack;
  bool report_close_brace_after_semi_insert;
  bool eof_semi_inserted;
  bool push_layout_stack_after_open_brace;
};

void scanner_reset(struct scanner *scanner) {
  scanner->layout_stack = NULL;
  scanner->report_close_brace_after_semi_insert = false;
  scanner->eof_semi_inserted = false;
  scanner->push_layout_stack_after_open_brace = false;
}

void scanner_push_indent(struct scanner *scanner, int indent_length) {
  struct layout_stack_entry *above = malloc(sizeof(struct layout_stack_entry));
  above->below = scanner->layout_stack;
  above->indent_length = indent_length;
  scanner->layout_stack = above;
}

int scanner_pop_indent(struct scanner *scanner) {
  if (scanner->layout_stack == NULL) {
    return -1;
  }

  int res = scanner->layout_stack->indent_length;
  struct layout_stack_entry *below = scanner->layout_stack->below;
  free(scanner->layout_stack);
  scanner->layout_stack = below;
  return res;
}

// Mixing tabs and spaces appears to be legal, and tabs seem to take up a visual
// width of 8 based on lexer.l. This seems dangerous, might want to look into
// this...
#define TABWIDTH 8

static inline void advance(TSLexer *lexer) { lexer->advance(lexer, false); }

static inline void skip(TSLexer *lexer) { lexer->advance(lexer, true); }

void *tree_sitter_koka_external_scanner_create() {
  struct scanner *scanner = malloc(sizeof(struct scanner));
  scanner_reset(scanner);
  return scanner;
}

void tree_sitter_koka_external_scanner_destroy(void *payload) {
  struct scanner *scanner = payload;
  while (scanner_pop_indent(scanner) >= 0)
    ;
  free(scanner);
}

unsigned tree_sitter_koka_external_scanner_serialize(void *payload,
                                                     char *buffer) {
#if defined(__STDC_VERSION__) && (__STDC_VERSION__ >= 201112L)
  _Static_assert(sizeof(bool) * 3 <= TREE_SITTER_SERIALIZATION_BUFFER_SIZE,
                 "serialization size is too small");
#else
  assert(sizeof(bool) * 3 <= TREE_SITTER_SERIALIZATION_BUFFER_SIZE &&
         "serialization size is too small");
#endif

  struct scanner *scanner = payload;

  ((bool *)buffer)[0] = scanner->report_close_brace_after_semi_insert;
  ((bool *)buffer)[1] = scanner->eof_semi_inserted;
  ((bool *)buffer)[2] = scanner->push_layout_stack_after_open_brace;
  int length = sizeof(bool) * 3;

  // BUG: If we run out of space, there's nothing else we can do other than drop
  // indent levels. We shouldn't ever have that much indents in real life
  // though so it's fine.
  for (int *write = (int *)(&((bool *)buffer)[3]);
       length < TREE_SITTER_SERIALIZATION_BUFFER_SIZE;
       write++, length += sizeof(int)) {
    *write = scanner_pop_indent(scanner);
    if (*write < 0) {
      break;
    }
  };
  if (length > TREE_SITTER_SERIALIZATION_BUFFER_SIZE) {
    length -= sizeof(int);
  }

  return length;
}

void tree_sitter_koka_external_scanner_deserialize(void *payload,
                                                   const char *buffer,
                                                   unsigned length) {
  struct scanner *scanner = payload;
  scanner_reset(scanner);

  if (length == 0) {
    return;
  }

  assert(length >= sizeof(bool) * 3 && "invalid length");
  scanner->report_close_brace_after_semi_insert = ((bool *)buffer)[0];
  scanner->eof_semi_inserted = ((bool *)buffer)[1];
  scanner->push_layout_stack_after_open_brace = ((bool *)buffer)[2];
  for (int *read = (int *)(&((bool *)buffer)[3]);
       ((char *)read) - buffer < length; read++) {
    scanner_push_indent(scanner, *read);
  }
}

bool tree_sitter_koka_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {
  struct scanner *scanner = payload;
  if (scanner->report_close_brace_after_semi_insert) {
    scanner->report_close_brace_after_semi_insert = false;
    lexer->result_symbol = CloseBrace;

    lexer->mark_end(lexer);
    advance(lexer);
    if (!lexer->eof(lexer)) {
      // Ensure we don't mark into the end so we can be revisited to emit the
      // final ';' at eof.
      lexer->mark_end(lexer);
    }

    return true;
  }

  lexer->mark_end(lexer);

  // ' ', '\t', '\r', '\n'
  bool found_eol = false;
  int indent_length = 0;
  while (true) {
    switch (lexer->lookahead) {
    case ' ':
      indent_length++;
      break;

    case '\t':
      indent_length += TABWIDTH;
      break;

    case '\r':
      indent_length = 0;
      break;

    case '\n':
      found_eol = true;
      indent_length = 0;
      break;

    default:
      goto AFTER_WHITESPACE;
    }

    skip(lexer);
  }

AFTER_WHITESPACE:
  if (scanner->push_layout_stack_after_open_brace) {
    scanner_push_indent(scanner,
                        found_eol ? indent_length : lexer->get_column(lexer));
    scanner->push_layout_stack_after_open_brace = false;
  }

  bool is_start_cont = false;
  bool maybe_start_cont = false;
  switch (lexer->lookahead) {
  case '$':
  case '%':
  case '&':
  case '*':
  case '+':
  case '@':
  case '!':
  case '\\':
  case '^':
  case '~':
  case '?':
  case '.':
  case '=':
  case ')':
  case ']':
  case '{':
  case '}':
    // On this branch, we're sure that the token we encountered is a start
    // continuation token.
    is_start_cont = true;
    break;

  case '>': // Excluding ">>", ">|<"
  case '<': // Also "<-", excluding "<<"
  case ':': // Also ":="
  case '-': // Also "->"
  case '|': // Also "||"
  case 't': // For "then"
  case 'e': // For "else" and "elif"
    // On this branch, we're not sure, but it might be. Note that the lookahead
    // token possibilities here are disjoint with those in the switch at the
    // end, which is good because it means we can advance the lookahead to
    // figure out what's going on, then skip the switch at the bottom because we
    // know it wouldn't have produced anything.
    maybe_start_cont = true;
    break;

  default:
    // On this branch, we know the token can't be a start continuation token.
    break;
  };

  if (found_eol) {
    int prev_indent_length = scanner->layout_stack != NULL
                                 ? scanner->layout_stack->indent_length
                                 : 0;
    if (valid_symbols[OpenBrace] && prev_indent_length < indent_length &&
        !is_start_cont) {
      // TODO: Check maybe_start_cont.
      scanner_push_indent(scanner, indent_length);
      lexer->result_symbol = OpenBrace;
      return true;
    }

    if (valid_symbols[Semicolon] && valid_symbols[CloseBrace] &&
        prev_indent_length > indent_length && lexer->lookahead != '}') {
      scanner_pop_indent(scanner);
      lexer->result_symbol = Semicolon;
      scanner->report_close_brace_after_semi_insert = true;
      return true;
    }

    if (valid_symbols[Semicolon] && prev_indent_length == indent_length &&
        !is_start_cont) {
      // TODO: Check maybe_start_cont.
      lexer->result_symbol = Semicolon;
      lexer->mark_end(lexer);
      advance(lexer);
      return true;
    }
  }

  if (lexer->eof(lexer) && !scanner->eof_semi_inserted) {
    scanner->eof_semi_inserted = true;
    lexer->result_symbol = Semicolon;
    return true;
  }

  if (maybe_start_cont) {
    // See the comment on the branch of the switch that sets this.
    return false;
  }
  switch (lexer->lookahead) {
  case '{':
    if (!valid_symbols[OpenBrace]) {
      break;
    }

    lexer->result_symbol = OpenBrace;
    advance(lexer);
    lexer->mark_end(lexer);
    assert(!scanner->push_layout_stack_after_open_brace &&
           "encountered '{' before layout stack push for previous '{' was "
           "handled");
    scanner->push_layout_stack_after_open_brace = true;
    return true;

  case '}':
    if (!valid_symbols[CloseBrace]) {
      break;
    }

    scanner_pop_indent(scanner);
    lexer->result_symbol = Semicolon;
    lexer->mark_end(lexer);
    scanner->report_close_brace_after_semi_insert = true;
    return true;

  case ';':
    if (!valid_symbols[Semicolon]) {
      break;
    }

    lexer->result_symbol = Semicolon;
    advance(lexer);
    lexer->mark_end(lexer);
    return true;

  case 'r':
    if (!valid_symbols[RawString]) {
      break;
    }

    advance(lexer);

    int pound_count = 0;
    while (lexer->lookahead == '#') {
      pound_count++;
      advance(lexer);
    }
    if (lexer->lookahead != '"') {
      return false;
    }

    while (!lexer->eof(lexer)) {
      advance(lexer);
      if (lexer->lookahead == '"') {
        bool too_few_pounds = false;
        for (int pounds_remaining = pound_count; pounds_remaining > 0;
             pounds_remaining--) {
          advance(lexer);
          if (lexer->lookahead != '#') {
            too_few_pounds = true;
            break;
          }
        }
        if (!too_few_pounds) {
          break;
        }
      }
    }
    if (lexer->eof(lexer)) {
      break;
    }

    lexer->result_symbol = RawString;
    advance(lexer);
    lexer->mark_end(lexer);
    return true;
  }

  return false;
}
