import { useEffect, useRef, useState } from "react";

const questions = [
  {
    icon: "📝",
    question: "چطور پست بگذارم؟",
    answer:
      "در صفحه اصلی متن بنویس یا عکس/ویدیو انتخاب کن و روی دکمه Post بزن.",
  },
  {
    icon: "🖼️",
    question: "چطور عکس پروفایل عوض کنم؟",
    answer:
      "وارد پروفایل خودت شو، عکس انتخاب کن و روی Upload Avatar بزن.",
  },
  {
    icon: "✉️",
    question: "چطور به کسی پیام بدهم؟",
    answer: "وارد پروفایل کاربر شو و روی Message بزن.",
  },
  {
    icon: "👥",
    question: "چطور کسی را فالو کنم؟",
    answer: "وارد پروفایل کاربر شو و روی Follow بزن.",
  },
  {
    icon: "⚠️",
    question: "چرا آپلود گاهی خطا می‌دهد؟",
    answer:
      "گاهی مسیر اینترنت یا سرویس ذخیره‌سازی کند می‌شود. کمی بعد دوباره امتحان کن.",
  },
  {
    icon: "🔵",
    question: "چگونه تیک آبی بگیرم؟",
    answer:
      "در بله به آیدی @castlex1 مراجعه کنید و با ارسال مدارک لازم، رسمی بودن یا لیدر بودن خود را اثبات کنید.",
  },
  {
    icon: "👑",
    question: "چگونه تیک طلایی بگیرم؟",
    answer:
      "تیک طلایی مخصوص ادمین‌های سایت است و برای کاربران معمولی امکان‌پذیر نیست.",
  },
  {
    icon: "🚩",
    question: "چطور تخلف کسی را گزارش دهم؟",
    answer:
      "وارد پروفایل شخص شوید، روی Report کلیک کنید و دلیل گزارش را بنویسید.",
  },
  {
    icon: "💬",
    question: "جواب سوال خود را پیدا نکردید؟",
    answer:
      "در بله به پیوی @castlex1 مراجعه کنید و سوال خود را بپرسید.",
  },
];

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const scrollAreaRef = useRef(null);
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
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  fontSize: "22px",
                  cursor: "pointer",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ×
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
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "23px",
                    flexShrink: 0,
                  }}
                >
                  🤖
                </div>

                <div
                  style={{
                    minWidth: 0,
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "900",
                      fontSize: "16px",
                    }}
                  >
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
            ref={scrollAreaRef}
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
                      color: active ? "#fff" : "#111827",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    {item.icon}
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
          fontSize: "27px",
          cursor: "pointer",
          boxShadow: "0 14px 34px rgba(29,155,240,0.42)",
          zIndex: 99999,
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
        }}
      >
        {open ? "×" : "🤖"}
      </button>
    </>
  );
}