import XCTest
import SwiftTreeSitter
import TreeSitterKoka

final class TreeSitterKokaTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_koka())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Koka grammar")
    }
}
