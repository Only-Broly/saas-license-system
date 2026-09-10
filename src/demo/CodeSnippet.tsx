export default function CodeSnippet({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-[13px] leading-relaxed text-slate-100 shadow-inner">
      <code>{code}</code>
    </pre>
  );
}
