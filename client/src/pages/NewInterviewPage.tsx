import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

type Technology = { id: string; name: string };
type Role = 'frontend' | 'backend' | 'datascience';

const roles: Record<Role, Technology[]> = {
  frontend: [
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue.js' },
    { id: 'angular', name: 'Angular' },
  ],
  backend: [
    { id: 'node', name: 'Node.js' },
    { id: 'python', name: 'Python' },
    { id: 'go', name: 'Go' },
  ],
  datascience: [
    { id: 'pandas', name: 'Pandas' },
    { id: 'numpy', name: 'NumPy' },
    { id: 'scikit-learn', name: 'Scikit-learn' },
  ],
};

const NewInterviewPage = () => {
  const [, setLocation] = useLocation();
  const [interviewType, setInterviewType] = useState('hr');
  const [technicalRole, setTechnicalRole] = useState<Role | ''>('');
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  useEffect(() => {
    setSelectedTechnologies([]);
  }, [technicalRole]);

  const handleStartInterview = () => {
    const params = new URLSearchParams();
    params.append('type', interviewType);
    params.append('difficulty', difficulty);

    if (interviewType === 'technical') {
      if (technicalRole) {
        params.append('role', technicalRole);
      }
      if (selectedTechnologies.length > 0) {
        params.append('techs', selectedTechnologies.join(','));
      }
    }

    setLocation(`/interview/session?${params.toString()}`);
  };

  const isTechnical = interviewType === 'technical';

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Start a New Interview</CardTitle>
          <CardDescription>Choose the type of interview you want to begin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="font-semibold">Interview Type</Label>
            <RadioGroup value={interviewType} onValueChange={setInterviewType} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hr" id="hr" />
                <Label htmlFor="hr">HR Round</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="technical" id="technical" />
                <Label htmlFor="technical">Technical Round</Label>
              </div>
            </RadioGroup>
          </div>

          {isTechnical && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <Label htmlFor="technical-role" className="font-semibold">Select Role</Label>
              <Select value={technicalRole} onValueChange={(value) => setTechnicalRole(value as Role)}>
                <SelectTrigger id="technical-role">
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="datascience">Data Science</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Difficulty selection (applies to all interview types) */}
          <div className="space-y-2 animate-in fade-in duration-300">
            <Label htmlFor="difficulty" className="font-semibold">Difficulty</Label>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as 'beginner' | 'intermediate' | 'advanced')}>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isTechnical && technicalRole && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <Label className="font-semibold">Select Technologies</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    {selectedTechnologies.length > 0
                      ? selectedTechnologies
                          .map((techId) => roles[technicalRole].find((t) => t.id === techId)?.name)
                          .join(', ')
                      : 'Select technologies...'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                  {roles[technicalRole].map((tech) => (
                    <DropdownMenuItem key={tech.id} onSelect={(e) => e.preventDefault()}>
                      <Checkbox
                        id={tech.id}
                        checked={selectedTechnologies.includes(tech.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTechnologies([...selectedTechnologies, tech.id]);
                          } else {
                            setSelectedTechnologies(selectedTechnologies.filter((id) => id !== tech.id));
                          }
                        }}
                      />
                      <Label htmlFor={tech.id} className="ml-2 cursor-pointer">{tech.name}</Label>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <Button
            onClick={handleStartInterview}
            className="w-full transition-transform hover:-translate-y-[1px]"
            disabled={isTechnical && (!technicalRole || selectedTechnologies.length === 0)}
          >
            Start Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewInterviewPage;
