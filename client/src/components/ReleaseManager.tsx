import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Send, Shield, CheckCircle, Clock, FileText, Tag, ExternalLink } from "lucide-react";

interface ChangelogEntry {
  category: string;
  changes: string[];
}

interface Release {
  id: number;
  version: string;
  versionType: string;
  versionNumber: number;
  title: string | null;
  changelog: string;
  highlights: string | null;
  status: string;
  publishedAt: string | null;
  isBlockchainVerified: boolean;
  blockchainTxHash: string | null;
  releaseHash: string | null;
  createdBy: string | null;
  notes: string | null;
  createdAt: string;
}

const CHANGELOG_CATEGORIES = [
  "Features",
  "Improvements", 
  "Fixes",
  "Performance",
  "Security",
  "UI/UX"
];

export function ReleaseManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    version: "",
    versionType: "stable",
    title: "",
    notes: "",
    changelog: [{ category: "Features", changes: [""] }] as ChangelogEntry[],
  });

  const { data: releases = [], isLoading } = useQuery<Release[]>({
    queryKey: ['releases'],
    queryFn: async () => {
      const res = await fetch('/api/releases');
      if (!res.ok) throw new Error('Failed to fetch releases');
      return res.json();
    },
  });

  const { data: latestRelease } = useQuery<Release | null>({
    queryKey: ['latestRelease'],
    queryFn: async () => {
      const res = await fetch('/api/releases/latest');
      if (!res.ok) return null;
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          changelog: data.changelog.filter(c => c.changes.some(ch => ch.trim()))
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create release');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      setShowForm(false);
      setForm({
        version: "",
        versionType: "stable",
        title: "",
        notes: "",
        changelog: [{ category: "Features", changes: [""] }],
      });
      toast({ title: "Release Created", description: "Draft saved successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/releases/${id}/publish`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to publish');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['latestRelease'] });
      const msg = data.isBlockchainVerified 
        ? `${data.version} published and verified on Solana!`
        : `${data.version} published successfully`;
      toast({ title: "Published!", description: msg });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to publish release", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/releases/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      toast({ title: "Deleted", description: "Draft release deleted" });
    },
  });

  const addChangelogCategory = () => {
    setForm(prev => ({
      ...prev,
      changelog: [...prev.changelog, { category: "Features", changes: [""] }]
    }));
  };

  const updateChangelogCategory = (idx: number, category: string) => {
    setForm(prev => ({
      ...prev,
      changelog: prev.changelog.map((c, i) => i === idx ? { ...c, category } : c)
    }));
  };

  const addChangeItem = (catIdx: number) => {
    setForm(prev => ({
      ...prev,
      changelog: prev.changelog.map((c, i) => 
        i === catIdx ? { ...c, changes: [...c.changes, ""] } : c
      )
    }));
  };

  const updateChangeItem = (catIdx: number, changeIdx: number, value: string) => {
    setForm(prev => ({
      ...prev,
      changelog: prev.changelog.map((c, i) => 
        i === catIdx 
          ? { ...c, changes: c.changes.map((ch, ci) => ci === changeIdx ? value : ch) }
          : c
      )
    }));
  };

  const removeChangeItem = (catIdx: number, changeIdx: number) => {
    setForm(prev => ({
      ...prev,
      changelog: prev.changelog.map((c, i) => 
        i === catIdx 
          ? { ...c, changes: c.changes.filter((_, ci) => ci !== changeIdx) }
          : c
      )
    }));
  };

  const parseChangelog = (changelogStr: string): ChangelogEntry[] => {
    try {
      return JSON.parse(changelogStr);
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            Release Manager
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Current: {latestRelease?.version || "No releases"} 
            {latestRelease?.title && ` "${latestRelease.title}"`}
            {latestRelease?.isBlockchainVerified && (
              <span className="ml-2 text-emerald-400">
                <Shield className="w-3 h-3 inline" /> Blockchain Verified
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
          data-testid="button-new-release"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Release
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-800/50 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Create New Release
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Version</Label>
                <Input
                  placeholder="v2.1.9"
                  value={form.version}
                  onChange={(e) => setForm(p => ({ ...p, version: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-version"
                />
              </div>
              <div>
                <Label className="text-slate-300">Type</Label>
                <Select value={form.versionType} onValueChange={(v) => setForm(p => ({ ...p, versionType: v }))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beta">Beta</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="hotfix">Hotfix</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Title (optional)</Label>
                <Input
                  placeholder="Feature Name"
                  value={form.title}
                  onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-title"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-slate-300">Changelog</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addChangelogCategory}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Category
                </Button>
              </div>
              
              {form.changelog.map((cat, catIdx) => (
                <div key={catIdx} className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                  <Select 
                    value={cat.category} 
                    onValueChange={(v) => updateChangelogCategory(catIdx, v)}
                  >
                    <SelectTrigger className="w-40 mb-2 bg-slate-600 border-slate-500 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANGELOG_CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {cat.changes.map((change, changeIdx) => (
                    <div key={changeIdx} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Describe the change..."
                        value={change}
                        onChange={(e) => updateChangeItem(catIdx, changeIdx, e.target.value)}
                        className="bg-slate-600 border-slate-500 text-white text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeChangeItem(catIdx, changeIdx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => addChangeItem(catIdx)}
                    className="text-emerald-400 hover:text-emerald-300 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Change
                  </Button>
                </div>
              ))}
            </div>

            <div>
              <Label className="text-slate-300">Internal Notes (optional)</Label>
              <Textarea
                placeholder="Notes for your team..."
                value={form.notes}
                onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.version || createMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                data-testid="button-save-draft"
              >
                {createMutation.isPending ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center text-slate-400 py-8">Loading releases...</div>
        ) : releases.length === 0 ? (
          <div className="text-center text-slate-400 py-8">No releases yet. Create your first release!</div>
        ) : (
          releases.map((release) => {
            const changelog = parseChangelog(release.changelog);
            return (
              <Card 
                key={release.id} 
                className={`bg-slate-800/50 border-slate-700 ${release.status === 'published' ? 'border-l-4 border-l-emerald-500' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-bold text-white">{release.version}</span>
                        {release.title && (
                          <span className="text-slate-400">"{release.title}"</span>
                        )}
                        <Badge 
                          variant={release.versionType === 'major' ? 'default' : 'outline'}
                          className={
                            release.versionType === 'beta' ? 'border-amber-500 text-amber-400' :
                            release.versionType === 'hotfix' ? 'border-red-500 text-red-400' :
                            release.versionType === 'major' ? 'bg-purple-600 text-white' :
                            'border-blue-500 text-blue-400'
                          }
                        >
                          {release.versionType}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={release.status === 'published' ? 'border-emerald-500 text-emerald-400' : 'border-slate-500 text-slate-400'}
                        >
                          {release.status === 'published' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                          {release.status}
                        </Badge>
                        {release.isBlockchainVerified && (
                          <a
                            href={`https://solscan.io/tx/${release.blockchainTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs"
                            data-testid={`link-blockchain-${release.id}`}
                          >
                            <Shield className="w-3 h-3" />
                            Solana Verified
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      
                      {changelog.length > 0 && (
                        <div className="mt-2 text-sm text-slate-400">
                          {changelog.map((cat, idx) => (
                            <div key={idx}>
                              <span className="font-medium text-slate-300">{cat.category}:</span>{' '}
                              {cat.changes.filter(c => c.trim()).join(', ')}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-1 text-xs text-slate-500">
                        Created {new Date(release.createdAt).toLocaleDateString()}
                        {release.createdBy && ` by ${release.createdBy}`}
                        {release.publishedAt && ` · Published ${new Date(release.publishedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-start">
                      {release.status === 'draft' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => publishMutation.mutate(release.id)}
                            disabled={publishMutation.isPending}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600"
                            data-testid={`button-publish-${release.id}`}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Publish
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(release.id)}
                            className="text-red-400 hover:text-red-300"
                            data-testid={`button-delete-${release.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
