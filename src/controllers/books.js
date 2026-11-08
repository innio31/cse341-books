import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  authorExists
} from '../models/books.js';

const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (error) {
    console.error('GET /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getBookByIdHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const book = await getBookById(requestedId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error('GET /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createBookHandler = async (req, res) => {
  const { id, authorId, title, publicationDate } = req.body;

  if (!id || !authorId || !title || !publicationDate) {
    return res.status(400).json({
      message: 'id, authorId, title, and publicationDate are required'
    });
  }

  try {
    const existing = await getBookById(id);

    if (existing) {
      return res.status(400).json({ message: 'A book with this id already exists' });
    }

    const authorOk = await authorExists(authorId);

    if (!authorOk) {
      return res.status(400).json({ message: 'authorId does not match an existing author' });
    }

    const newBook = { id, authorId, title, publicationDate };
    await createBook(newBook);

    return res.status(201).json(newBook);
  } catch (error) {
    console.error('POST /books failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBookHandler = async (req, res) => {
  const requestedId = req.params.id;
  const { authorId, title, publicationDate } = req.body;

  if (!authorId || !title || !publicationDate) {
    return res.status(400).json({
      message: 'authorId, title, and publicationDate are required'
    });
  }

  try {
    const authorOk = await authorExists(authorId);

    if (!authorOk) {
      return res.status(400).json({ message: 'authorId does not match an existing author' });
    }

    const updatedBook = { authorId, title, publicationDate };
    const result = await updateBook(requestedId, updatedBook);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json({ id: requestedId, ...updatedBook });
  } catch (error) {
    console.error('PUT /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBookHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const result = await deleteBook(requestedId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('DELETE /books/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getBooksHandler,
  getBookByIdHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler
};