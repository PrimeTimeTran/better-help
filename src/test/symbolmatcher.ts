import { describe, it, expect } from "vitest";
import { scoreLine } from "../resolver";

describe("Symbol Scoring Engine", () => {
  const symbol = "run_agent_loop";

  it("assigns highest score to the actual function definition", () => {
    const line = "pub async fn run_agent_loop(user_input: String) -> anyhow::Result<()> {";
    expect(scoreLine(line, symbol)).toBe(100);
  });

  it("assigns lower scores to comments", () => {
    expect(scoreLine("// fn run_agent_loop() {}", symbol)).toBe(5);
    expect(scoreLine("/// fn run_agent_loop() {}", symbol)).toBe(10);
  });

  it("assigns zero to unrelated lines", () => {
    expect(scoreLine("fn main() { println!('hello'); }", symbol)).toBe(0);
  });
});
