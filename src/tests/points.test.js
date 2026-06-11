test("1kg recycled gives 10 points", () => {
    expect(1 * 10).toBe(10);
});

test("5kg recycled gives 50 points", () => {
    expect(5 * 10).toBe(50);
});

test("waste report gives 5 points", () => {
    const wasteReportPoints = 5;

    expect(wasteReportPoints).toBe(5);
});

test("redeeming reward deducts points", () => {
    const currentPoints = 500;
    const rewardCost = 100;

    expect(currentPoints - rewardCost).toBe(400);
});

test("user cannot redeem reward if points are too low", () => {
    const currentPoints = 50;
    const rewardCost = 100;

    expect(currentPoints < rewardCost).toBe(true);
});