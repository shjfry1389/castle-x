import { useState } from "react";

const questions = [
  {
    question: "چطور پست بگذارم؟",
    answer: "در صفحه اصلی متن بنویس یا عکس/ویدیو انتخاب کن و روی Post بزن.",
  },
  {
    question: "چطور عکس پروفایل عوض کنم؟",
    answer: "وارد پروفایل خودت شو، عکس انتخاب کن و روی Upload Avatar بزن.",
  },
  {
    question: "چطور به کسی پیام بدهم؟",
    answer: "وارد پروفایل کاربر شو و روی Message بزن.",
  },
  {
    question: "چطور کسی را فالو کنم؟",
    answer: "وارد پروفایل کاربر شو و روی Follow بزن.",
  },
  {
    question: "چرا آپلود گاهی خطا می‌دهد؟",
    answer: "گاهی مسیر اینترنت به سرویس‌های ذخیره‌سازی مشکل دارد. کمی بعد دوباره امتحان کن.",
  },
    {
    question: "چگونه تیک آبی بگیرم؟",
    answer: "در بله به ایدی @castlex1 مراجعه کنید و با ارسال و اثبات لیدر بودن یا دارای مقام رسمی بودن در اتحاد تیک ابی خود را دریافت کنید",
  },
      {
    question: "چگونه تیک طلایی بگیرم؟",
    answer: "تیک طلایی مخصوص ادمین های سایت هست و برای کاربرای معمولی امکان پذیر نیست",
  },
      {
    question: "چطور تخلف کسی را در سایت گزارش دهم؟",
    answer: "ابتدا وارد پروفایل شخص شوید سپس بر روی report کلیک کنید و با نوشتن اسم کاربر و دلیل گزارش میتوانید گزارش خود را ثبت کنید",
  },
        {
    question: "جواب سوال خود را پیدا نکردید؟",
    answer: "در بله به پیوی @castlex1 مراجعه کنید و سوال خود را بپرسید",
  },
];

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed",
            right: "18px",
            bottom: "92px",
            width: "340px",
            maxWidth: "calc(100vw - 32px)",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "18px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
            zIndex: 99999,
            overflow: "hidden",
            direction: "rtl",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              background: "#1d9bf0",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: "800",
            }}
          >
            <span>دستیار Castle X</span>

            <button
              onClick={() => setOpen(false)}
              style={{
                border: "none",
                background: "none",
                color: "#fff",
                fontSize: "22px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              padding: "14px",
              maxHeight: "420px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                background: "#f1f5f9",
                color: "#111827",
                padding: "10px 12px",
                borderRadius: "14px",
                marginBottom: "12px",
                fontSize: "14px",
                lineHeight: "1.8",
              }}
            >
              سلام! یکی از سوال‌ها را انتخاب کن.
            </div>

            {questions.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelected(item)}
                style={{
                  width: "100%",
                  border: "1px solid #e5e7eb",
                  background:
                    selected?.question === item.question ? "#e8f4ff" : "#fff",
                  color: "#111827",
                  textAlign: "right",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  marginBottom: "8px",
                  fontWeight: "600",
                  lineHeight: "1.7",
                }}
              >
                {item.question}
              </button>
            ))}

            {selected && (
              <div
                style={{
                  marginTop: "12px",
                  background: "#111827",
                  color: "#fff",
                  padding: "12px",
                  borderRadius: "14px",
                  lineHeight: "1.9",
                  fontSize: "14px",
                }}
              >
                {selected.answer}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "fixed",
          right: "18px",
          bottom: "78px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: "#1d9bf0",
          color: "#fff",
          fontSize: "25px",
          cursor: "pointer",
          boxShadow: "0 12px 30px rgba(29,155,240,0.35)",
          zIndex: 99999,
        }}
      >
        🤖
      </button>
    </>
  );
}