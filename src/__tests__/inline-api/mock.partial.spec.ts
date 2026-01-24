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

it("should stub the methods automatically if not provided", async () => {
    const response = await registerBook("The Greate Gatsby", m.Mock({
        isBookNameAvailable: m.resolves({ isAvailable: true }),
    }));
    expect(response).toEqual({ isAvailable: true, id: expect.any(String) });
    // To explain, above should only be possible if repository.saveBook is stubbed. Otherwise it would throw an error
    // because sut is trying to call the method => it can only work if it's been auto stubbed.
});


interface UserRepository {
  getUser: (id: number) => string;
  saveUser: (user: { id: number; name: string }) => void;
}

function sut(userRepository: UserRepository) {
  userRepository.getUser(1);
  userRepository.saveUser({ id: 1, name: "John" });
}

test("mocking only get", () => {

  expect(sut(m.Mock({
    getUser: m.returns("User 1"),
  }))).toBeUndefined();

  const mock2 = m.Mock<UserRepository>({
    getUser: m.returns("User 1"),
  });
  
  expect(sut(mock2)).toBeUndefined();
});