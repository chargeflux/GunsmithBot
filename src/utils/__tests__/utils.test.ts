import { groupByDuplicates } from "../utils";

describe("group", () => {
  test.each([
    {
      input: [1, 1, 1, 2, 2, 2, 3],
      expected: [[0, 1, 2], [3, 4, 5], [6]],
    },
    {
      input: [1, 2, 3],
      expected: [[0], [1], [2]],
    },
    {
      input: [1],
      expected: [[0]],
    },
    {
      input: [],
      expected: [],
    },
  ])("group", ({ input, expected }) => {
    const res = groupByDuplicates(input);
    expect(res).toStrictEqual(expected);
  });
});
