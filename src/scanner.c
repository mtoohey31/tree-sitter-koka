#include <assert.h>
#include <stdio.h>
#include <string.h>
#include <tree_sitter/parser.h>
#include <wctype.h>

enum TokenType { OpenBrace, CloseBrace, Semicolon, RawString };

struct scanner {
  bool report_close_brace_after_semi_insert;
  bool eof_semi_inserted;
};

void scanner_reset(struct scanner *scanner) {
  scanner->report_close_brace_after_semi_insert = false;
  scanner->eof_semi_inserted = false;
}

void *tree_sitter_koka_external_scanner_create() {
  struct scanner *scanner = malloc(sizeof(struct scanner));
  scanner_reset(scanner);
  return scanner;
}

void tree_sitter_koka_external_scanner_destroy(void *payload) { free(payload); }

unsigned tree_sitter_koka_external_scanner_serialize(void *payload,
                                                     char *buffer) {
  _Static_assert(sizeof(struct scanner) <=
                     TREE_SITTER_SERIALIZATION_BUFFER_SIZE,
                 "not enough room in buffer for scanner");
  memcpy(buffer, payload, sizeof(struct scanner));
  return sizeof(struct scanner);
}

void tree_sitter_koka_external_scanner_deserialize(void *payload,
                                                   const char *buffer,
                                                   unsigned length) {
  struct scanner *scanner = payload;
  scanner_reset(scanner);

  if (length == 0) {
    return;
  }

  assert(length == sizeof(struct scanner) && "invalid length");
  memcpy(payload, buffer, sizeof(struct scanner));
}

bool tree_sitter_koka_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {
  struct scanner *scanner = payload;
  if (scanner->report_close_brace_after_semi_insert) {
    assert(lexer->lookahead == '}' && "unexpected lookahead");
    scanner->report_close_brace_after_semi_insert = false;
    lexer->result_symbol = CloseBrace;
    lexer->advance(lexer, false);
    return true;
  }

  while (iswspace(lexer->lookahead))
    lexer->advance(lexer, true);

  if (lexer->eof(lexer) && !scanner->eof_semi_inserted) {
    scanner->eof_semi_inserted = true;
    lexer->result_symbol = Semicolon;
    return true;
  }

  switch (lexer->lookahead) {
  case '{':
    if (!valid_symbols[OpenBrace]) {
      break;
    }

    lexer->result_symbol = OpenBrace;
    lexer->advance(lexer, false);
    return true;

  case '}':
    if (!valid_symbols[CloseBrace]) {
      break;
    }

    lexer->result_symbol = Semicolon;
    scanner->report_close_brace_after_semi_insert = true;
    return true;

  case ';':
    if (!valid_symbols[Semicolon]) {
      break;
    }

    lexer->result_symbol = Semicolon;
    lexer->advance(lexer, false);
    return true;

  case 'r':
    if (!valid_symbols[RawString]) {
      break;
    }

    lexer->advance(lexer, false);

    int pound_count = 0;
    while (lexer->lookahead == '#') {
      pound_count++;
      lexer->advance(lexer, false);
    }
    if (lexer->lookahead != '"') {
      return false;
    }

    while (!lexer->eof(lexer)) {
      lexer->advance(lexer, false);
      if (lexer->lookahead == '"') {
        bool too_few_pounds = false;
        for (int pounds_remaining = pound_count; pounds_remaining > 0;
             pounds_remaining--) {
          lexer->advance(lexer, false);
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
    lexer->advance(lexer, false);
    return true;
  }

  return false;
}
