import { Contest } from "@/components/contest/contest";

export function ContestPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Các cuộc thi
          </h1>
          <p className="text-muted-foreground">
            Tham gia cuộc thi để kiểm tra năng lực
          </p>
        </div>
        <Contest />
      </div>
    </div>
  );
}
