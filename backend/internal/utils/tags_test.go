package utils

import (
	"reflect"
	"testing"
)

func TestNormalizeTags(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected []string
	}{
		{
			name:     "empty input",
			input:    []string{},
			expected: []string{},
		},
		{
			name:     "single tag",
			input:    []string{"JavaScript"},
			expected: []string{"javascript"},
		},
		{
			name:     "multiple tags with duplicates",
			input:    []string{"JavaScript", "React", "javascript", "  Go  "},
			expected: []string{"javascript", "react", "go"},
		},
		{
			name:     "empty and whitespace tags",
			input:    []string{"", "  ", "React", ""},
			expected: []string{"react"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := NormalizeTags(tt.input)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("NormalizeTags() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestValidateTag(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{
			name:     "valid tag",
			input:    "javascript",
			expected: true,
		},
		{
			name:     "valid tag with dash",
			input:    "react-native",
			expected: true,
		},
		{
			name:     "valid tag with underscore",
			input:    "node_js",
			expected: true,
		},
		{
			name:     "empty tag",
			input:    "",
			expected: false,
		},
		{
			name:     "tag too long",
			input:    "this-is-a-very-long-tag-name-that-exceeds-the-limit",
			expected: false,
		},
		{
			name:     "tag with special characters",
			input:    "tag@with#special",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ValidateTag(tt.input)
			if result != tt.expected {
				t.Errorf("ValidateTag(%q) = %v, want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestSanitizeTag(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "simple tag",
			input:    "JavaScript",
			expected: "javascript",
		},
		{
			name:     "tag with spaces",
			input:    "React Native",
			expected: "react-native",
		},
		{
			name:     "tag with multiple spaces",
			input:    "Node   JS",
			expected: "node-js",
		},
		{
			name:     "tag with leading/trailing dashes",
			input:    "-typescript-",
			expected: "typescript",
		},
		{
			name:     "tag with multiple consecutive dashes",
			input:    "vue--js",
			expected: "vue-js",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitizeTag(tt.input)
			if result != tt.expected {
				t.Errorf("SanitizeTag(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}
