import {
  getAllAuthors as getAllAuthorsFromDb,
  getAuthorById as getAuthorByIdFromDb,
  createAuthor as createAuthorInDb,
  updateAuthor as updateAuthorInDb,
  deleteAuthor as deleteAuthorFromDb,
  authorHasBooks
} from '../models/authors.js';

const getAllAuthors = async (req, res) => {
  try {
    const authors = await getAllAuthorsFromDb();
    return res.status(200).json(authors);
  } catch (error) {
    console.error('GET /authors failed:', error.message);
    return res.status(500).json({ message: 'Unable to retrieve authors.' });
  }
};

const getAuthorById = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const author = await getAuthorByIdFromDb(requestedId);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(200).json(author);
  } catch (error) {
    console.error('GET /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createAuthor = async (req, res) => {
  const { id, name, birthYear } = req.body;

  if (!id || !name || birthYear === undefined || typeof birthYear !== 'number') {
    return res.status(400).json({
      message: 'id, name, and birthYear are required and birthYear must be a number'
    });
  }

  try {
    const existing = await getAuthorByIdFromDb(id);

    if (existing) {
      return res.status(400).json({ message: 'An author with this id already exists' });
    }

    const newAuthor = { id, name, birthYear };
    await createAuthorInDb(newAuthor);

    return res.status(201).json(newAuthor);
  } catch (error) {
    console.error('POST /authors failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateAuthor = async (req, res) => {
  const requestedId = req.params.id;
  const { name, birthYear } = req.body;

  if (!name || birthYear === undefined || typeof birthYear !== 'number') {
    return res.status(400).json({
      message: 'name and birthYear are required and birthYear must be a number'
    });
  }

  try {
    const updatedAuthor = { name, birthYear };
    const result = await updateAuthorInDb(requestedId, updatedAuthor);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(200).json({ id: requestedId, ...updatedAuthor });
  } catch (error) {
    console.error('PUT /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAuthor = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const stillHasBooks = await authorHasBooks(requestedId);

    if (stillHasBooks) {
      return res.status(409).json({
        message: 'Cannot delete author while books reference this author'
      });
    }

    const result = await deleteAuthorFromDb(requestedId);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('DELETE /authors/:id failed:', error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
};