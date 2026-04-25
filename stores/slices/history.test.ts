import { describe, it, expect, beforeEach } from "vitest";
import { usePlaygroundStore } from "../playground";

beforeEach(() => {
  usePlaygroundStore.getState().clearHistory();
  localStorage.clear();
});

describe("HistorySlice", () => {
  it("pushes new entry", () => {
    usePlaygroundStore
      .getState()
      .pushToHistory({ source: "foo", flags: ["g"] });
    const { entries } = usePlaygroundStore.getState();
    expect(entries).toHaveLength(1);
    expect(entries[0].source).toBe("foo");
    expect(entries[0].flags).toEqual(["g"]);
    expect(entries[0].id).toBeTypeOf("string");
    expect(entries[0].id.length).toBeGreaterThan(0);
    expect(entries[0].createdAt).toBeTypeOf("number");
    expect(entries[0].createdAt).toBeGreaterThan(0);
    expect(entries[0].createdAt).toBeLessThanOrEqual(Date.now());
    expect(entries[0].lastSeenAt).toBeGreaterThanOrEqual(entries[0].createdAt);
  });
  it("dedupes by source + flags and moves the entry to top (MRU)", () => {
    const { pushToHistory } = usePlaygroundStore.getState();
    pushToHistory({ source: "foo", flags: ["g"] });
    pushToHistory({ source: "bar", flags: ["i"] });
    const originalEntry = usePlaygroundStore
      .getState()
      .entries.find((e) => e.source === "foo")!;
    pushToHistory({ source: "foo", flags: ["g"] });
    const { entries } = usePlaygroundStore.getState();
    expect(entries).toHaveLength(2);
    expect(entries[0].source).toBe("foo");
    expect(entries[0].id).toBe(originalEntry.id);
    expect(entries[0].createdAt).toBe(originalEntry.createdAt);
    expect(entries[1].source).toBe("bar");
  });
  it("caps history at 30 entries (FIFO)", () => {
    const { pushToHistory } = usePlaygroundStore.getState();
    for (let i = 0; i < 31; i++) {
      pushToHistory({ source: `pattern-${i}`, flags: ["g"] });
    }
    const { entries } = usePlaygroundStore.getState();
    expect(entries).toHaveLength(30);
    expect(entries[0].source).toBe("pattern-30");
    expect(entries.find((e) => e.source === "pattern-0")).toBeUndefined();
  });
  it("removes an entry by id", () => {
    const { pushToHistory } = usePlaygroundStore.getState();
    pushToHistory({ source: "a", flags: [] });
    pushToHistory({ source: "b", flags: [] });
    pushToHistory({ source: "c", flags: [] });
    const middleEntry = usePlaygroundStore
      .getState()
      .entries.find((e) => e.source === "b")!;
    usePlaygroundStore.getState().removeFromHistory(middleEntry.id);
    const { entries } = usePlaygroundStore.getState();
    expect(entries).toHaveLength(2);
    expect(entries.find((e) => e.id === middleEntry.id)).toBeUndefined();
    expect(entries[0].source).toBe("c");
    expect(entries[1].source).toBe("a");
  });
  it("clears all entries", () => {
    const { pushToHistory } = usePlaygroundStore.getState();
    for (let i = 0; i < 5; i++) {
      pushToHistory({ source: `s${i}`, flags: [] });
    }
    const { entries: before } = usePlaygroundStore.getState();
    expect(before).toHaveLength(5);
    usePlaygroundStore.getState().clearHistory();
    const { entries: after } = usePlaygroundStore.getState();
    expect(after).toHaveLength(0);
  });
  it("dedupes regardless of flag order", () => {
    const { pushToHistory } = usePlaygroundStore.getState();
    pushToHistory({ source: "foo", flags: ["g", "i"] });
    pushToHistory({ source: "foo", flags: ["i", "g"] });
    const { entries } = usePlaygroundStore.getState();
    expect(entries).toHaveLength(1);
  });
});
