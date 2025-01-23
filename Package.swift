// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterKoka",
    products: [
        .library(name: "TreeSitterKoka", targets: ["TreeSitterKoka"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterKoka",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterKokaTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterKoka",
            ],
            path: "bindings/swift/TreeSitterKokaTests"
        )
    ],
    cLanguageStandard: .c11
)
