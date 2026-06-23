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

function RobotIcon({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      <defs>
        <linearGradient id="botShell" x1="14" y1="12" x2="60" y2="64">
          <stop stopColor="#e0f2fe" />
          <stop offset="0.45" stopColor="#93c5fd" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>

        <linearGradient id="botFace" x1="20" y1="25" x2="52" y2="52">
          <stop stopColor="#0f172a" />
          <stop offset="1" stopColor="#1e1b4b" />
        </linearGradient>

        <linearGradient id="botEye" x1="24" y1="35" x2="48" y2="42">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#c084fc" />
        </linearGradient>

        <filter id="botShadow" x="6" y="6" width="60" height="60">
          <feDropShadow
            dx="0"
            dy="7"
            stdDeviation="5"
            floodColor="#0f172a"
            floodOpacity="0.25"
          />
        </filter>
      </defs>

      <g filter="url(#botShadow)">
        <rect
          x="13"
          y="20"
          width="46"
          height="38"
          rx="19"
          fill="url(#botShell)"
        />

        <rect
          x="19"
          y="27"
          width="34"
          height="25"
          rx="12.5"
          fill="url(#botFace)"
        />

        <path
          d="M28 18c1.8-4.2 5-6.3 8-6.3s6.2 2.1 8 6.3"
          stroke="#e0f2fe"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <circle cx="36" cy="10" r="4" fill="#22c55e" />
        <circle cx="36" cy="10" r="7" stroke="#bbf7d0" strokeOpacity="0.45" />

        <path
          d="M13.5 36H9.5C7.6 36 6 37.6 6 39.5S7.6 43 9.5 43H13.5"
          stroke="#dbeafe"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        <path
          d="M58.5 36h4c1.9 0 3.5 1.6 3.5 3.5S64.4 43 62.5 43h-4"
          stroke="#dbeafe"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        <circle cx="29" cy="40" r="4" fill="url(#botEye)" />
        <circle cx="43" cy="40" r="4" fill="url(#botEye)" />

        <path
          d="M31 47c2.8 2.1 7.2 2.1 10 0"
          stroke="#e0f2fe"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M23.5 29.5c5-3.8 20-3.8 25 0"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.65"
        />

        <path
          d="M53.5 18.5l1.2 2.5 2.6 1.1-2.6 1.1-1.2 2.5-1.1-2.5-2.6-1.1 2.6-1.1 1.1-2.5Z"
          fill="#ffffff"
          opacity="0.9"
        />
      </g>
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
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <RobotIcon size={40} />
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
        {open ? <CloseIcon /> : <RobotIcon size={42} />}
      </button>
    </>
  );
}