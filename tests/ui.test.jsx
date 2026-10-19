import { describe, it, expect } from "vitest";
import React from "react";
import ProductCard from "../frontend/src/components/ProductCard.jsx";

describe("Vishal Jewellery Store — UI Component Tests", () => {
  it("ProductCard should export a valid React component function", () => {
    expect(typeof ProductCard).toBe("function");
  });

  it("ProductCard should have valid parameter signature", () => {
    expect(ProductCard.length).toBe(1);
  });
});
