#include <stdio.h>
#include <tree_sitter/parser.h>
#include <wctype.h>

enum TokenType { OpenBrace, CloseBrace, Semicolon, RawString };

void *tree_sitter_koka_external_scanner_create() { return NULL; }

void tree_sitter_koka_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_koka_external_scanner_serialize(void *payload,
                                                     char *buffer) {
  return 0;
}

void tree_sitter_koka_external_scanner_deserialize(void *payload,
                                                   const char *buffer,
                                                   unsigned length) {}

bool tree_sitter_koka_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {
  while (iswspace(lexer->lookahead))
    lexer->advance(lexer, true);

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

    lexer->result_symbol = CloseBrace;
    lexer->advance(lexer, false);
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
