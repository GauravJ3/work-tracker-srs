const BLIND_75 = [
  ["Two Sum", "Array", "Easy"],
  ["Best Time to Buy and Sell Stock", "Array", "Easy"],
  ["Contains Duplicate", "Array", "Easy"],
  ["Product of Array Except Self", "Array", "Medium"],
  ["Maximum Subarray", "Array", "Medium"],
  ["Maximum Product Subarray", "Array", "Medium"],
  ["Find Minimum in Rotated Sorted Array", "Array", "Medium"],
  ["Search in Rotated Sorted Array", "Array", "Medium"],
  ["3Sum", "Array", "Medium"],
  ["Container With Most Water", "Array", "Medium"],
  ["Sum of Two Integers", "Bit Manipulation", "Medium"],
  ["Number of 1 Bits", "Bit Manipulation", "Easy"],
  ["Counting Bits", "Bit Manipulation", "Easy"],
  ["Missing Number", "Bit Manipulation", "Easy"],
  ["Reverse Bits", "Bit Manipulation", "Easy"],
  ["Climbing Stairs", "Dynamic Programming", "Easy"],
  ["Coin Change", "Dynamic Programming", "Medium"],
  ["Longest Increasing Subsequence", "Dynamic Programming", "Medium"],
  ["Longest Common Subsequence", "Dynamic Programming", "Medium"],
  ["Word Break", "Dynamic Programming", "Medium"],
  ["House Robber", "Dynamic Programming", "Medium"],
  ["House Robber II", "Dynamic Programming", "Medium"],
  ["Decode Ways", "Dynamic Programming", "Medium"],
  ["Unique Paths", "Dynamic Programming", "Medium"],
  ["Jump Game", "Dynamic Programming", "Medium"],
  ["Clone Graph", "Graph", "Medium"],
  ["Course Schedule", "Graph", "Medium"],
  ["Pacific Atlantic Water Flow", "Graph", "Medium"],
  ["Number of Islands", "Graph", "Medium"],
  ["Longest Consecutive Sequence", "Graph", "Medium"],
  ["Number of Connected Components in an Undirected Graph", "Graph", "Medium"],
  ["Alien Dictionary", "Graph", "Hard"],
  ["Word Ladder", "Graph", "Hard"],
  ["Insert Interval", "Interval", "Medium"],
  ["Merge Intervals", "Interval", "Medium"],
  ["Non-overlapping Intervals", "Interval", "Medium"],
  ["Meeting Rooms II", "Interval", "Medium"],
  ["Minimum Interval to Include Each Query", "Interval", "Hard"],
  ["Reverse Linked List", "Linked List", "Easy"],
  ["Linked List Cycle", "Linked List", "Easy"],
  ["Merge Two Sorted Lists", "Linked List", "Easy"],
  ["Merge k Sorted Lists", "Linked List", "Hard"],
  ["Remove Nth Node From End of List", "Linked List", "Medium"],
  ["Reorder List", "Linked List", "Medium"],
  ["Set Matrix Zeroes", "Matrix", "Medium"],
  ["Spiral Matrix", "Matrix", "Medium"],
  ["Rotate Image", "Matrix", "Medium"],
  ["Word Search", "Matrix", "Medium"],
  ["Longest Substring Without Repeating Characters", "String", "Medium"],
  ["Longest Repeating Character Replacement", "String", "Medium"],
  ["Minimum Window Substring", "String", "Hard"],
  ["Valid Anagram", "String", "Easy"],
  ["Group Anagrams", "String", "Medium"],
  ["Valid Parentheses", "String", "Easy"],
  ["Valid Palindrome", "String", "Easy"],
  ["Longest Palindromic Substring", "String", "Medium"],
  ["Palindromic Substrings", "String", "Medium"],
  ["Implement Trie (Prefix Tree)", "String", "Medium"],
  ["Maximum Depth of Binary Tree", "Tree", "Easy"],
  ["Same Tree", "Tree", "Easy"],
  ["Invert Binary Tree", "Tree", "Easy"],
  ["Binary Tree Maximum Path Sum", "Tree", "Hard"],
  ["Binary Tree Level Order Traversal", "Tree", "Medium"],
  ["Serialize and Deserialize Binary Tree", "Tree", "Hard"],
  ["Subtree of Another Tree", "Tree", "Easy"],
  ["Construct Binary Tree from Preorder and Inorder Traversal", "Tree", "Medium"],
  ["Validate Binary Search Tree", "Tree", "Medium"],
  ["Kth Smallest Element in a BST", "Tree", "Medium"],
  ["Lowest Common Ancestor of a BST", "Tree", "Medium"],
  ["Lowest Common Ancestor of a Binary Tree", "Tree", "Medium"],
  ["Top K Frequent Elements", "Heap", "Medium"],
  ["Find Median from Data Stream", "Heap", "Hard"],
  ["Combination Sum", "Backtracking", "Medium"],
  ["Word Search II", "Backtracking", "Hard"],
  ["Subsets", "Backtracking", "Medium"],
];

const PROBLEM_META = {
  "Number of Connected Components in an Undirected Graph": {
    premium: true,
    alt: "https://www.lintcode.com/problem/365/",
  },
  "Alien Dictionary": {
    premium: true,
    alt: "https://www.lintcode.com/problem/892/",
  },
  "Meeting Rooms II": {
    premium: true,
    alt: "https://neetcode.io/problems/meeting-schedule-ii",
  },
};

function slugify(title) {
  return String(title)
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const blindItems = BLIND_75.map(([title, category, difficulty], index) => {
  const meta = PROBLEM_META[title] || {};
  const slug = slugify(title);
  return {
    id: `b75-${index + 1}`,
    title,
    category,
    difficulty,
    premium: Boolean(meta.premium),
    link: `https://leetcode.com/problems/${slug}/`,
    alt: meta.alt || `https://www.google.com/search?q=${encodeURIComponent(`${title} solution`)}`,
  };
});
