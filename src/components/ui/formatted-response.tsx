import { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

interface FormattedResponseProps {
  content: string
  className?: string
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean
}

const FormattedResponse: React.FC<FormattedResponseProps> = ({ content, className }) => {
  const memoizedContent = useMemo(() => content, [content])

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <ReactMarkdown
          className="prose dark:prose-invert max-w-none"
          components={{
            h1: ({ ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
            h2: ({ ...props }) => <h2 className="text-xl font-semibold mb-3" {...props} />,
            h3: ({ ...props }) => <h3 className="text-lg font-medium mb-2" {...props} />,
            p: ({ ...props }) => <p className="mb-4" {...props} />,
            ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
            ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
            li: ({ ...props }) => <li className="mb-1" {...props} />,
            a: ({ ...props }) => (
              <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
            ),
            code: ({ inline, children, ...props }: CodeProps) =>
              inline ? (
                <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                  {children}
                </code>
              ) : (
                <pre className="bg-muted p-2 rounded-md overflow-x-auto">
                  <code className="text-sm" {...props}>
                    {children}
                  </code>
                </pre>
              ),
          }}
        >
          {memoizedContent}
        </ReactMarkdown>
      </CardContent>
    </Card>
  )
}

export default FormattedResponse