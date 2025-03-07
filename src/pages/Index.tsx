
import Header from "@/components/Header";
import PostGenerator from "@/components/PostGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto pt-10">
          <div className="text-center mb-12 fade-in">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              LinkedIn Post Generator
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Craft Perfect LinkedIn Posts
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Generate engaging, professional LinkedIn content in seconds using Together AI's Mistral technology.
            </p>
          </div>
          
          <PostGenerator />
          
          <div className="mt-24 text-center text-sm text-muted-foreground fade-in">
            <p>Powered by Together AI's Mistral (7B) Instruct v0.3 model</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
