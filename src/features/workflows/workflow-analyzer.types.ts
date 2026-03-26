export interface AnalyzerNode {
  id: string;
  type: string;
  name: string;
  params: Record<string, any>;
  output_variable?: string | null;
  waitForInput?: boolean;
}

export interface AnalyzerInput {
  business_id: string;
  nodes: AnalyzerNode[];
  connections: Record<string, any>;
}

export interface AnalyzerResult {
  nodes: AnalyzerNode[];
  connections: Record<string, any>;
}
