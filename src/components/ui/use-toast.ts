// src/components/ui/use-toast.ts
type ToastPayload = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  function toast(t: ToastPayload) {
    const msg = [t.title, t.description].filter(Boolean).join(" — ");
    if (t.variant === "destructive") console.error("[toast]", msg);
    else console.log("[toast]", msg);

    try {
      window.dispatchEvent(new CustomEvent("__app_toast__", { detail: t }));
    } catch {
      // no-op
    }
  }
  return { toast };
}
