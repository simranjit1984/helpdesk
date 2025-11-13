interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="bg-bluegrey-25 px-8 py-8">
      <h1 className="text-[42px] font-medium leading-[50px] text-bluegrey-750">
        {title}
      </h1>
    </div>
  );
}
