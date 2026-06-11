test("valid email contains @", () => {
    expect("tester@test.com").toContain("@");
});

test("password length is at least 8", () => {
    expect("password".length).toBeGreaterThanOrEqual(8);
});

test("invalid email should not pass validation", () => {
    const email = "tester.com";

    expect(email.includes("@")).toBe(false);
});

test("short password should fail length check", () => {
    const password = "pass";

    expect(password.length).toBeLessThan(8);
});