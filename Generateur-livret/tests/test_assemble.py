import unittest

from assemble import booklet_order


class BookletOrderTests(unittest.TestCase):
    def test_four_page_booklet(self):
        self.assertEqual(booklet_order(4), (4, [(4, 1), (2, 3)]))

    def test_incomplete_booklet_is_padded(self):
        self.assertEqual(booklet_order(5), (8, [(8, 1), (2, 7), (6, 3), (4, 5)]))

    def test_every_page_appears_once_after_padding(self):
        total, pairs = booklet_order(10)
        pages = [page for pair in pairs for page in pair]
        self.assertEqual(total, 12)
        self.assertEqual(sorted(pages), list(range(1, 13)))


if __name__ == "__main__":
    unittest.main()

