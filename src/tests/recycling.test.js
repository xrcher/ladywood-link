test("recycling weight must be greater than 0", () => {
    const weight = 5;
    expect(weight).toBeGreaterThan(0);
});

test("zero recycling weight should be invalid", () => {
    const weight = 0;

    expect(weight).toBeLessThanOrEqual(0);
});

test("negative recycling weight should be invalid", () => {
    const weight = -3;

    expect(weight).toBeLessThan(0);
});