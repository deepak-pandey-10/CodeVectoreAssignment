import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Books",
  "Sports",
  "Furniture",
];

const LIMIT = 20;
const ELLIPSIS = "...";

function getPageItems(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, ELLIPSIS, totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      ELLIPSIS,
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, ELLIPSIS, page - 1, page, page + 1, ELLIPSIS, totalPages];
}

function formatCurrency(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ProductRow({ product }) {
  return (
    <tr>
      <td>
        <div className="product-name">{product.name}</div>
        <div className="product-id">ID {product.id}</div>
      </td>
      <td>
        <span className="badge">{product.category}</span>
      </td>
      <td className="price">{formatCurrency(product.price)}</td>
      <td>{formatDate(product.updatedAt)}</td>
    </tr>
  );
}

function App() {
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCategory = category === "All" ? "" : category;

  const productCountLabel = useMemo(() => {
    if (products.length === 0) {
      return "No products loaded";
    }

    return `${pagination.total} product${pagination.total === 1 ? "" : "s"} found`;
  }, [pagination.total, products.length]);

  const pageItems = useMemo(
    () => getPageItems(page, pagination.totalPages),
    [page, pagination.totalPages]
  );

  const fetchProducts = useCallback(
    async (targetPage = 1) => {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams({
        limit: String(LIMIT),
        page: String(targetPage),
      });

      if (selectedCategory) {
        params.set("category", selectedCategory);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/products?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch products right now.");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Unable to fetch products.");
        }

        setProducts(result.data);
        setPagination({
          total: result.total || 0,
          totalPages: result.totalPages || 0,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategory]
  );

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };

  return (
    <main className="app-shell">
      <section className="toolbar">
        <div>
          <p className="eyebrow">Product Catalog</p>
          <h1>Browse backend products</h1>
          <p className="subtitle">
            Page-based pagination with category filtering from your Express API.
          </p>
        </div>

        <div className="status-card">
          <span>{productCountLabel}</span>
          <strong>
            Page {pagination.totalPages === 0 ? 0 : page} of{" "}
            {pagination.totalPages}
          </strong>
        </div>
      </section>

      <section className="filters" aria-label="Product filters">
        <label className="select-field">
          <span>Category</span>
          <select value={category} onChange={handleCategoryChange}>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      <section className="content-panel">
        {isLoading ? (
          <div className="empty-state">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products found.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <nav className="pagination" aria-label="Product pagination">
        <button
          className="page-button"
          disabled={page <= 1 || isLoading}
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
          type="button"
        >
          Previous
        </button>

        <div className="page-list">
          {pageItems.map((item, index) =>
            item === ELLIPSIS ? (
              <span className="page-ellipsis" key={`${item}-${index}`}>
                {ELLIPSIS}
              </span>
            ) : (
              <button
                className={item === page ? "page-number active" : "page-number"}
                disabled={isLoading}
                key={item}
                onClick={() => setPage(item)}
                type="button"
              >
                {item}
              </button>
            )
          )}
        </div>

        <button
          className="page-button"
          disabled={page >= pagination.totalPages || isLoading}
          onClick={() =>
            setPage((current) =>
              Math.min(current + 1, pagination.totalPages)
            )
          }
          type="button"
        >
          Next
        </button>
      </nav>
    </main>
  );
}

export default App;
