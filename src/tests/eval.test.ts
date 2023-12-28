import { evaluateStateComparisonType } from "../dispatch-action/evaluate-state-comparison-type";

test("evaluateStateComparisonType() recommends shallow copy for non protecting state container or action", async () => {
  expect(
    evaluateStateComparisonType({
      action: {
        name: "test",
      },
      containerConfig: {},
    })
  ).toEqual("shallow");
});

test("evaluateStateComparisonType() recommends deep copy for protecting state action", async () => {
  expect(
    evaluateStateComparisonType({
      action: {
        name: "test",
        protectState: true,
      },
      containerConfig: {
        protectState: false,
      },
    })
  ).toEqual("deep");
});

test("evaluateStateComparisonType() recommends shallow copy for protecting state container and non-protecting state action", async () => {
  expect(
    evaluateStateComparisonType({
      action: {
        name: "test",
        protectState: false,
      },
      containerConfig: {
        protectState: true,
      },
    })
  ).toEqual("shallow");
});

test("evaluateStateComparisonType() recommends deep copy for both protecting state container and protecting state action", async () => {
  expect(
    evaluateStateComparisonType({
      action: {
        name: "test",
        protectState: true,
      },
      containerConfig: {
        protectState: true,
      },
    })
  ).toEqual("deep");
});

