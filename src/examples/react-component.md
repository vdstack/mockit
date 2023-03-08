React component often receive functions as props. With Mockit you can easily mock these functions and check if they are called with the correct arguments.

In this example, we will use a component that displays a counter and a button.
When the button is clicked, the counter increments.
Once the counter reaches 5, the button is replaced with another one that will trigger the onClick function prop.

```tsx
// src\examples\CountThenTrigger.tsx
function CountThenTrigger({ onClick }: { onClick: (arg: string) => void }) {
  const [counter, setCounter] = useState<number>(0);
  return (
    <div>
      <p>Counter: {counter}</p>
      {counter < 5 ? (
        <button onClick={() => setCounter(counter + 1)}>Increment</button>
      ) : (
        <button onClick={() => onClick("Hello world!")}>Trigger</button>
      )}
    </div>
  );
}
```

Now here are the tests:

```tsx
// src\examples\CountThenTrigger.test.tsx
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mockFunction, suppose, verify } from "@vdstack/mockit";

import { CountThenTrigger } from "./CountThenTrigger";

test("it should not trigger the onClick function until the counter reaches 5", () => {
  const onClick = mockFunction((arg: string) => {});
  const { getByRole } = render(<CountThenTrigger onClick={onClick} />);

  suppose(onClick).willNotBeCalled();

  Array.from({ length: 5 }).forEach(() => {
    userEvent.click(getByRole("button", { name: "Increment" }));
  });

  verify(onClick);
});

test("it should trigger the onClick function when the counter reaches 5", () => {
  const onClick = mockFunction((arg: string) => {});
  const { getByRole } = render(<CountThenTrigger onClick={onClick} />);

  suppose(onClick).willBeCalledWith("Hello world!").once();

  Array.from({ length: 5 }).forEach(() => {
    userEvent.click(getByRole("button", { name: "Increment" }));
  });

  // The button should now be replaced with a button that triggers the onClick function
  userEvent.click(getByRole("button", { name: "Trigger" }));

  verify(onClick);
});
```
