test("valid email contains @", () => {
    expect("tester@test.com").toContain("@");
});

test("password length is at least 8", () => {
    expect("password".length).toBeGreaterThanOrEqual(8);
});