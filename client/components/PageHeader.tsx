interface PageHeaderProps {
  title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="bg-bluegrey-25 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-medium leading-tight lg:leading-[50px] text-bluegrey-750">
        {title}
      </h1>
    </div>
  );
}
