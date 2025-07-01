package tree_sitter_engleri_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_engleri "github.com/tree-sitter/tree-sitter-engleri/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_engleri.Language())
	if language == nil {
		t.Errorf("Error loading Engleri grammar")
	}
}
