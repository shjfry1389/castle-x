import { useEffect, useRef, useState } from "react";

const questions = [
  {
    type: "post",
    question: "چطور پست بگذارم؟",
    answer:
      "در صفحه اصلی متن بنویس یا عکس/ویدیو انتخاب کن و روی دکمه Post بزن.",
  },
  {
    type: "avatar",
    question: "چطور عکس پروفایل عوض کنم؟",
    answer:
      "وارد پروفایل خودت شو، عکس انتخاب کن و روی Upload Avatar بزن.",
  },
  {
    type: "message",
    question: "چطور به کسی پیام بدهم؟",
    answer: "وارد پروفایل کاربر شو و روی Message بزن.",
  },
  {
    type: "follow",
    question: "چطور کسی را فالو کنم؟",
    answer: "وارد پروفایل کاربر شو و روی Follow بزن.",
  },
  {
    type: "upload",
    question: "چرا آپلود گاهی خطا می‌دهد؟",
    answer:
      "گاهی مسیر اینترنت یا سرویس ذخیره‌سازی کند می‌شود. کمی بعد دوباره امتحان کن.",
  },
  {
    type: "blue",
    question: "چگونه تیک آبی بگیرم؟",
    answer:
      "در بله به آیدی @castlex1 مراجعه کنید و با ارسال مدارک لازم، رسمی بودن یا لیدر بودن خود را اثبات کنید.",
  },
  {
    type: "gold",
    question: "تیک طلایی چیست؟",
    answer:
      "تیک طلایی مخصوص ادمین‌های سایت است و برای کاربران معمولی امکان‌پذیر نیست.",
  },
  {
    type: "report",
    question: "چطور تخلف کسی را گزارش دهم؟",
    answer:
      "وارد پروفایل شخص شوید، روی Report کلیک کنید و دلیل گزارش را بنویسید.",
  },
  {
    type: "help",
    question: "جواب سوال خود را پیدا نکردید؟",
    answer:
      "در بله به پیوی @castlex1 مراجعه کنید و سوال خود را بپرسید.",
  },
];

function RobotIcon({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="13" y="22" width="38" height="29" rx="13" fill="#0f172a" />
      <rect x="17" y="26" width="30" height="21" rx="10" fill="#ffffff" />
      <circle cx="26" cy="36" r="3.4" fill="#1d9bf0" />
      <circle cx="38" cy="36" r="3.4" fill="#7c3aed" />
      <path
        d="M27.5 42c2.6 2 6.4 2 9 0"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M32 22V13"
        stroke="#0f172a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="10" r="4.5" fill="#22c55e" />
      <path
        d="M13 34H8.5C6.6 34 5 35.6 5 37.5S6.6 41 8.5 41H13"
        stroke="#0f172a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M51 34h4.5c1.9 0 3.5 1.6 3.5 3.5S57.4 41 55.5 41H51"
        stroke="#0f172a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M20 25c3.5-4 20.5-4 24 0"
        stroke="#60a5fa"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MiniIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke={active ? "#fff" : "#1d9bf0"}
        strokeWidth="2.4"
      />
      <path
        d="M8.5 12.3l2.2 2.2 4.8-5"
        stroke={active ? "#fff" : "#7c3aed"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const answerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selected && answerRef.current) {
      setTimeout(() => {
        answerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 120);
    }
  }, [selected]);

  const buttonBottom = isMobile ? "94px" : "18px";
  const panelBottom = isMobile ? "168px" : "108px";

  return (
    <>
      <style>
        {`
          @keyframes assistantPop {
            from {
              opacity: 0;
              transform: translateY(14px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      {open && (
        <div
          style={{
            position: "fixed",
            right: isMobile ? "10px" : "18px",
            bottom: panelBottom,
            width: isMobile ? "calc(100vw - 20px)" : "360px",
            maxWidth: "calc(100vw - 20px)",
            background: "#ffffff",
            border: "1px solid rgba(15,23,42,0.08)",
            borderRadius: "24px",
            boxShadow: "0 24px 70px rgba(15,23,42,0.26)",
            zIndex: 99999,
            overflow: "hidden",
            direction: "rtl",
            animation: "assistantPop 0.22s ease-out",
            transformOrigin: "bottom right",
          }}
        >
          <div
            style={{
              padding: "16px",
              background: "linear-gradient(135deg,#1d9bf0,#7c3aed)",
              color: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row-reverse",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setOpen(false)}
                title="بستن"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CloseIcon />
              </button>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <RobotIcon size={36} />
                </div>

                <div style={{ minWidth: 0, textAlign: "right" }}>
                  <div style={{ fontWeight: "900", fontSize: "16px" }}>
                    دستیار Castle X
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.9,
                      marginTop: "2px",
                    }}
                  >
                    راهنمای سریع سایت
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "14px",
              maxHeight: isMobile ? "310px" : "430px",
              overflowY: "auto",
              background: "#f8fafc",
            }}
          >
            <div
              style={{
                background: "#ffffff",
                color: "#111827",
                padding: "12px 14px",
                borderRadius: "18px",
                marginBottom: "12px",
                fontSize: "14px",
                lineHeight: "1.9",
                border: "1px solid #e5e7eb",
                textAlign: "right",
              }}
            >
              سلام! یکی از سوال‌های آماده را انتخاب کن.
            </div>

            {questions.map((item, index) => {
              const active = selected?.question === item.question;

              return (
                <button
                  key={index}
                  onClick={() => setSelected(item)}
                  style={{
                    width: "100%",
                    border: active ? "1px solid #1d9bf0" : "1px solid #e5e7eb",
                    background: active ? "#e8f4ff" : "#ffffff",
                    color: "#111827",
                    textAlign: "right",
                    padding: "11px 12px",
                    borderRadius: "16px",
                    cursor: "pointer",
                    marginBottom: "8px",
                    fontWeight: "700",
                    lineHeight: "1.7",
                    display: "flex",
                    flexDirection: "row-reverse",
                    alignItems: "flex-start",
                    gap: "12px",
                    boxShadow: active
                      ? "0 8px 20px rgba(29,155,240,0.16)"
                      : "none",
                  }}
                >
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: active ? "#1d9bf0" : "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    <MiniIcon active={active} />
                  </span>

                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                      textAlign: "right",
                    }}
                  >
                    {item.question}
                  </span>
                </button>
              );
            })}

            {selected && (
              <div
                ref={answerRef}
                style={{
                  marginTop: "14px",
                  background: "#111827",
                  color: "#fff",
                  padding: "14px",
                  borderRadius: "18px",
                  lineHeight: "1.9",
                  fontSize: "14px",
                  boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    fontWeight: "900",
                    marginBottom: "6px",
                    color: "#93c5fd",
                  }}
                >
                  پاسخ
                </div>
                {selected.answer}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        title="دستیار سایت"
        style={{
          position: "fixed",
          right: "18px",
          bottom: buttonBottom,
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg,#1d9bf0,#7c3aed)",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 14px 34px rgba(29,155,240,0.42)",
          zIndex: 99999,
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {open ? <CloseIcon /> : <RobotIcon size={38} />}
      </button>
    </>
  );
}