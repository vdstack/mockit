import { m } from "../..";

interface Book {
    id: string;
    title: string;
    author: string;
    publishedAt: Date;
    isArchived: boolean;
}

interface BookRepository {
    getBook(id: string): Promise<Book>;
    isBookNameAvailable(name: string): Promise<{ isAvailable: false; id: string } | { isAvailable: true }>;
    saveBook(book: Book): Promise<void>;
    deleteBook(id: string): Promise<void>;
    archiveBook(id: string): Promise<void>;
    restoreBook(id: string): Promise<void>;
    unarchiveBook(id: string): Promise<void>;
}

async function registerBook(bookName: string, bookRepository: BookRepository) {
    const existingBook = await bookRepository.isBookNameAvailable(bookName);
    if (!existingBook.isAvailable) {
        return { isAvailable: false };
    }

    const newBook = {
        id: crypto.randomUUID(),
        title: bookName,
        author: "to define",
        publishedAt: new Date(),
        isArchived: false,
    }

    await bookRepository.saveBook(newBook);

    return { isAvailable: true, id: newBook.id };
}

it("should allow to setup a partial mock inline", async () => {
    const response = await registerBook("The Greate Gatsby", m.Mock({
        isBookNameAvailable: m.resolves({ isAvailable: false, id: "123" })
    }));
    expect(response).toEqual({ isAvailable: false });
});

it("should allow several setups", async () => {
    const response = await registerBook("The Greate Gatsby", m.Mock({
        isBookNameAvailable: m.resolves({ isAvailable: true }),
        saveBook: m.resolves(undefined),
    }));
    expect(response).toEqual({ isAvailable: true, id: expect.any(String) });
});