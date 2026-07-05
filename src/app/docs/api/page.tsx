import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiDocsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-muted-foreground mt-2">Access AcademiaAI tools programmatically with your API key.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            All API requests require an API key. Generate one in your{" "}
            <a href="/dashboard/settings" className="text-primary underline">Settings</a> page.
          </p>
          <p className="text-sm text-muted-foreground">
            Include the key in the Authorization header:
          </p>
          <pre className="p-3 bg-muted rounded-lg text-sm font-mono overflow-x-auto">
            Authorization: Bearer acad_YOUR_API_KEY
          </pre>
          <p className="text-sm text-muted-foreground">
            Rate limit: 100 requests per day on Pro, 1000/day on Business.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>POST /api/v1/humanize</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Humanize AI-generated text to sound more natural.
          </p>
          <pre className="p-3 bg-muted rounded-lg text-sm font-mono overflow-x-auto">{`curl -X POST https://your-domain.com/api/v1/humanize \\
  -H "Authorization: Bearer acad_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your AI-generated text here...", "level": "balanced"}'

# Response
{
  "original": "Your AI-generated text here...",
  "humanized": "Natural-sounding rewrite..."
}`}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>POST /api/v1/enhance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Enhance academic writing to a specific academic level.
          </p>
          <pre className="p-3 bg-muted rounded-lg text-sm font-mono overflow-x-auto">{`curl -X POST https://your-domain.com/api/v1/enhance \\
  -H "Authorization: Bearer acad_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your text here...", "level": "Masters"}'

# level: "High School" | "Undergraduate" | "Masters" | "PhD"

# Response
{
  "original": "Your text here...",
  "enhanced": "Enhanced academic text...",
  "level": "Masters"
}`}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>POST /api/v1/citations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Generate a formatted citation for a given source.
          </p>
          <pre className="p-3 bg-muted rounded-lg text-sm font-mono overflow-x-auto">{`curl -X POST https://your-domain.com/api/v1/citations \\
  -H "Authorization: Bearer acad_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"source": "Journal article title or DOI", "format": "APA"}'

# format: "APA" | "MLA" | "Chicago" | "Harvard"

# Response
{
  "source": "Journal article title or DOI",
  "format": "APA",
  "citation": "Smith, J. (2024). ..."
}`}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Codes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div><code className="bg-muted px-1 rounded">200</code> — Success</div>
          <div><code className="bg-muted px-1 rounded">400</code> — Missing required fields</div>
          <div><code className="bg-muted px-1 rounded">401</code> — Missing or invalid API key</div>
          <div><code className="bg-muted px-1 rounded">429</code> — Rate limit exceeded</div>
          <div><code className="bg-muted px-1 rounded">500</code> — Server error</div>
        </CardContent>
      </Card>
    </div>
  );
}
