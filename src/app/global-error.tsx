"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeContent: "center",
          gap: "12px",
          padding: "24px",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#1e293b",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", margin: 0 }}>
          화면을 불러오지 못했어요
        </h1>
        <p style={{ margin: 0, fontSize: ".9rem", color: "#64748b" }}>
          잠시 뒤 다시 시도해 주세요.
          {error.digest ? ` (오류 번호 ${error.digest})` : ""}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            justifySelf: "center",
            padding: "10px 18px",
            borderRadius: "12px",
            border: "none",
            background: "#4f46e5",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
