import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TooltipDemo() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Tooltip Component Variations</h1>

      <TooltipProvider>
        <div className="space-y-12">
          {/* Dark variant with title */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Dark Tooltip with Title</h2>
            <div className="flex gap-8 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover (Top)</Button>
                </TooltipTrigger>
                <TooltipContent
                  variant="dark"
                  size="md"
                  title="Tooltip title."
                  side="top"
                >
                  Write the tooltip content here.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover (Right)</Button>
                </TooltipTrigger>
                <TooltipContent
                  variant="dark"
                  size="md"
                  title="Tooltip title."
                  side="right"
                >
                  Write the tooltip content here.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover (Bottom)</Button>
                </TooltipTrigger>
                <TooltipContent
                  variant="dark"
                  size="md"
                  title="Tooltip title."
                  side="bottom"
                >
                  Write the tooltip content here.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover (Left)</Button>
                </TooltipTrigger>
                <TooltipContent
                  variant="dark"
                  size="md"
                  title="Tooltip title."
                  side="left"
                >
                  Write the tooltip content here.
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          {/* Dark variant without title */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">
              Dark Tooltip without Title
            </h2>
            <div className="flex gap-8 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover (Top)</Button>
                </TooltipTrigger>
                <TooltipContent variant="dark" size="md" side="top">
                  Write the tooltip content here.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover (Right)</Button>
                </TooltipTrigger>
                <TooltipContent variant="dark" size="md" side="right">
                  Write the tooltip content here.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover (Bottom)</Button>
                </TooltipTrigger>
                <TooltipContent variant="dark" size="md" side="bottom">
                  Write the tooltip content here.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover (Left)</Button>
                </TooltipTrigger>
                <TooltipContent variant="dark" size="md" side="left">
                  Write the tooltip content here.
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          {/* Default variant (backward compatibility) */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Default Tooltip Style</h2>
            <div className="flex gap-8 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me</Button>
                </TooltipTrigger>
                <TooltipContent>Simple tooltip content</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">With title</Button>
                </TooltipTrigger>
                <TooltipContent title="Title" side="right">
                  This is the content
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          {/* Size variations */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Size Variations</h2>
            <div className="flex gap-8 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Small</Button>
                </TooltipTrigger>
                <TooltipContent
                  variant="dark"
                  size="sm"
                  title="Small tooltip"
                  side="top"
                >
                  Small size content
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Medium</Button>
                </TooltipTrigger>
                <TooltipContent
                  variant="dark"
                  size="md"
                  title="Medium tooltip"
                  side="top"
                >
                  Medium size content
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          {/* No arrow variant */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Without Arrow</h2>
            <div className="flex gap-8 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">No Arrow</Button>
                </TooltipTrigger>
                <TooltipContent
                  variant="dark"
                  size="md"
                  title="No arrow tooltip"
                  showArrow={false}
                  side="top"
                >
                  This tooltip has no arrow
                </TooltipContent>
              </Tooltip>
            </div>
          </section>
        </div>
      </TooltipProvider>
    </div>
  );
}
