import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Tag, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createJournalEntry } from '@/lib/api';
import { EMOTIONS, Emotion, TradeType, MarketCondition } from '@/types/journal';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/integrations/supabase/types';

type EmotionType = Database['public']['Enums']['emotion_type'];
type TradeTypeEnum = Database['public']['Enums']['trade_type'];
type MarketConditionEnum = Database['public']['Enums']['market_condition'];
type TradeOutcome = Database['public']['Enums']['trade_outcome'];

const tradeTypes: { value: TradeType; label: string }[] = [
  { value: 'long', label: 'Long Position' },
  { value: 'short', label: 'Short Position' },
  { value: 'scalp', label: 'Scalping' },
  { value: 'swing', label: 'Swing Trade' },
  { value: 'day', label: 'Day Trade' },
];

const marketConditions: { value: MarketCondition; label: string }[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'ranging', label: 'Ranging' },
  { value: 'volatile', label: 'Volatile' },
  { value: 'calm', label: 'Calm' },
];

export default function Journal() {
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [emotionIntensity, setEmotionIntensity] = useState([3]);
  const [confidenceLevel, setConfidenceLevel] = useState([3]);
  const [tradeType, setTradeType] = useState<TradeType | ''>('');
  const [marketCondition, setMarketCondition] = useState<MarketCondition | ''>('');
  const [preTrade, setPreTrade] = useState('');
  const [duringTrade, setDuringTrade] = useState('');
  const [postTrade, setPostTrade] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<'profit' | 'loss' | 'breakeven' | ''>('');
  const [profitLoss, setProfitLoss] = useState('');
  const [currencyPair, setCurrencyPair] = useState('');
  const [takeProfitPips, setTakeProfitPips] = useState('');
  const [stopLossPips, setStopLossPips] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!preTrade && !duringTrade && !postTrade) {
      toast({
        title: 'Please add some reflections',
        description: 'At least one reflection section is required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await createJournalEntry({
      entry_date: new Date().toISOString(),
      emotion: emotion as EmotionType,
      emotion_intensity: emotionIntensity[0],
      confidence_level: confidenceLevel[0],
      trade_type: (tradeType || null) as TradeTypeEnum | null,
      market_condition: (marketCondition || null) as MarketConditionEnum | null,
      pre_trade: preTrade || null,
      during_trade: duringTrade || null,
      post_trade: postTrade || null,
      tags,
      outcome: (outcome || null) as TradeOutcome | null,
      profit_loss: profitLoss ? parseFloat(profitLoss) : null,
      currency_pair: currencyPair || null,
      take_profit_pips: takeProfitPips ? parseFloat(takeProfitPips) : null,
      stop_loss_pips: stopLossPips ? parseFloat(stopLossPips) : null,
    });

    if (error) {
      toast({
        title: 'Failed to save entry',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Entry saved!',
        description: 'Your journal entry has been recorded.',
      });

      // Reset form
      setEmotion('neutral');
      setEmotionIntensity([3]);
      setConfidenceLevel([3]);
      setTradeType('');
      setMarketCondition('');
      setPreTrade('');
      setDuringTrade('');
      setPostTrade('');
      setTags([]);
      setOutcome('');
      setProfitLoss('');
      setCurrencyPair('');
      setTakeProfitPips('');
      setStopLossPips('');
    }

    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          New <span className="text-gradient-gold">Journal Entry</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Document your thoughts and emotions around your trading session
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emotion Selection */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Current Emotion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
              {EMOTIONS.map((e) => (
                <motion.button
                  key={e.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEmotion(e.value)}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                    emotion === e.value
                      ? 'border-primary bg-primary/10 shadow-gold'
                      : 'border-border bg-muted/30 hover:border-muted-foreground/50'
                  }`}
                >
                  <span className="text-2xl">{e.emoji}</span>
                  <span className="text-xs text-muted-foreground">{e.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Emotion Intensity</Label>
                <Slider
                  value={emotionIntensity}
                  onValueChange={setEmotionIntensity}
                  min={1}
                  max={5}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Intense</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Confidence Level</Label>
                <Slider
                  value={confidenceLevel}
                  onValueChange={setConfidenceLevel}
                  min={1}
                  max={5}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Low</span>
                  <span>Neutral</span>
                  <span>Very High</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trade Details */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Trade Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Currency Pair</Label>
                <Input
                  placeholder="e.g., EUR/USD, GBP/JPY"
                  value={currencyPair}
                  onChange={(e) => setCurrencyPair(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Trade Type</Label>
                <Select value={tradeType} onValueChange={(v) => setTradeType(v as TradeType)}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select trade type" />
                  </SelectTrigger>
                  <SelectContent>
                    {tradeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Market Condition</Label>
                <Select
                  value={marketCondition}
                  onValueChange={(v) => setMarketCondition(v as MarketCondition)}
                >
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {marketConditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Take Profit (pips)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 50"
                  value={takeProfitPips}
                  onChange={(e) => setTakeProfitPips(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Stop Loss (pips)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 25"
                  value={stopLossPips}
                  onChange={(e) => setStopLossPips(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trade Outcome</Label>
                <div className="flex gap-2">
                  {[
                    { value: 'profit', label: 'Profit', icon: TrendingUp, color: 'text-success' },
                    { value: 'loss', label: 'Loss', icon: TrendingDown, color: 'text-destructive' },
                    { value: 'breakeven', label: 'Even', icon: Minus, color: 'text-muted-foreground' },
                  ].map((o) => (
                    <Button
                      key={o.value}
                      type="button"
                      variant={outcome === o.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setOutcome(o.value as typeof outcome)}
                      className="flex-1"
                    >
                      <o.icon className={`w-4 h-4 ${outcome === o.value ? '' : o.color}`} />
                      {o.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profit/Loss Amount</Label>
                <Input
                  type="number"
                  placeholder="e.g., 150 or -50"
                  value={profitLoss}
                  onChange={(e) => setProfitLoss(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reflections */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-xl">Reflections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Before the Trade</Label>
              <Textarea
                placeholder="What were you thinking and feeling before entering the trade? What was your analysis?"
                value={preTrade}
                onChange={(e) => setPreTrade(e.target.value)}
                className="min-h-24 bg-muted border-border resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>During the Trade</Label>
              <Textarea
                placeholder="How did your emotions evolve while the trade was active? Did you feel any urge to exit early?"
                value={duringTrade}
                onChange={(e) => setDuringTrade(e.target.value)}
                className="min-h-24 bg-muted border-border resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>After the Trade</Label>
              <Textarea
                placeholder="How do you feel about the outcome? What lessons did you learn?"
                value={postTrade}
                onChange={(e) => setPostTrade(e.target.value)}
                className="min-h-24 bg-muted border-border resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20 transition-colors"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Type a tag and press Enter (e.g., FOMO, Patience, EURUSD)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="bg-muted border-border"
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="submit" variant="gold" size="lg" disabled={isSubmitting}>
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
