import { Card, CardContent } from '@/components/ui/card';

const QuoteCard: React.FC = () => {
  return (
    <Card className="bg-stone-100/50 backdrop-blur-lg shadow-xl h-[200px] p-6">
      <CardContent className="flex flex-col items-center justify-center">
        <div className="flex gap-2 mt-4"></div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
