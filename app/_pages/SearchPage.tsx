import React, { useState, useEffect } from "react";
import {
  MagnifyingGlass,
  Funnel,
  Tag as TagIcon,
  Clock,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import MemoryCard from "@/components/MemoryCard";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import { Memory } from "@/types/types";
import DatePicker from "@/components/ui/DatePicker";
import MultiSelect from "@/components/ui/MultiSelect";
import { useMemories } from "@/hooks/useMemories";
import { useTags } from "@/hooks/useTags";

interface SearchPageProps {
  onMemoryClick: (memory: Memory) => void;
  onEditMemory: (memory: Memory) => void;
  onDeleteMemory: (memoryId: string) => void;
  onShareMemory: (memory: Memory) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({
  onMemoryClick,
  onEditMemory,
  onDeleteMemory,
  onShareMemory,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Memory[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [recentSearches] = useState([
    "family vacation",
    "birthday party",
    "work milestone",
  ]);

  const { data: memoriesData, isLoading } = useMemories();
  const { data: tagsData } = useTags();

  const allMemories = memoriesData?.memories || [];
  const availableTags = tagsData?.tags.map((t) => t.name) || [];
  const availableMoods = Array.from(
    new Set(allMemories.map((mem) => mem.mood).filter(Boolean)),
  ) as string[];

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = allMemories.filter((memory) => {
          const memoryTags = memory.tags as string[] | undefined;
          return (
            memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (memoryTags &&
              memoryTags.some((tag) =>
                tag.toLowerCase().includes(searchQuery.toLowerCase()),
              )) ||
            (memory.location &&
              memory.location
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (memory.mood &&
              memory.mood.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        });
        setSearchResults(filtered);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, allMemories]);

  const filteredMemories = React.useMemo(() => {
    const dataToFilter = searchQuery.trim() ? searchResults : allMemories;
    return dataToFilter.filter((memory) => {
      const memoryDate = new Date(memory.date);
      const matchesDateRange =
        (!startDate || memoryDate >= startDate) &&
        (!endDate || memoryDate <= endDate);

      const memoryTags = memory.tags as string[] | undefined;
      const matchesTags =
        selectedTags.length === 0 ||
        (memoryTags && selectedTags.every((tag) => memoryTags.includes(tag)));

      const matchesMoods =
        selectedMoods.length === 0 ||
        (memory.mood && selectedMoods.includes(memory.mood));

      return matchesDateRange && matchesTags && matchesMoods;
    });
  }, [
    searchQuery,
    searchResults,
    selectedTags,
    selectedMoods,
    startDate,
    endDate,
    allMemories,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-fit bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowsClockwise className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading memories...</p>
        </div>
      </div>
    );
  }

  const groupedResults = {
    memories: filteredMemories,
    tags: availableTags.filter((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    dates: [],
  };

  return (
    <div className="min-h-fit bg-neutral-50">
      <div className="">
        <main className="flex">
          <div className="p-6 ">
            {/* Search Header */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-neutral-900">
                  Search Memories
                </h1>
                <p className="text-neutral-600 mt-1">
                  Find memories by content, tags, dates, or locations
                </p>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search memories,..."
                  className="pl-12 text-lg py-3"
                />
                <MagnifyingGlass className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <ArrowsClockwise className="w-5 h-5 text-primary-600 animate-spin" />
                  </div>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilterModalOpen(true)}
                >
                  <Funnel className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            <Modal
              isOpen={filterModalOpen}
              onClose={() => setFilterModalOpen(false)}
              title="Filter Memories"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    Date Range
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DatePicker
                      label="Start Date"
                      value={
                        startDate ? startDate.toISOString().split("T")[0] : ""
                      }
                      onChange={(date) =>
                        setStartDate(date ? new Date(date) : null)
                      }
                    />
                    <DatePicker
                      label="End Date"
                      value={endDate ? endDate.toISOString().split("T")[0] : ""}
                      onChange={(date) =>
                        setEndDate(date ? new Date(date) : null)
                      }
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    Tags
                  </h3>
                  <MultiSelect
                    options={availableTags.map((tag) => ({
                      label: tag,
                      value: tag,
                    }))}
                    value={selectedTags}
                    onChange={setSelectedTags}
                    placeholder="Select tags"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    Moods
                  </h3>
                  <MultiSelect
                    options={availableMoods.map((mood) => ({
                      label: mood,
                      value: mood,
                    }))}
                    value={selectedMoods}
                    onChange={setSelectedMoods}
                    placeholder="Select moods"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedTags([]);
                      setSelectedMoods([]);
                      setStartDate(null);
                      setEndDate(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </Modal>

            {/* Search Results */}
            {searchQuery ||
            selectedTags.length > 0 ||
            selectedMoods.length > 0 ||
            startDate ||
            endDate ? (
              <div className="mt-8 space-y-8">
                {/* Memories Results */}
                {groupedResults.memories.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      Memories ({groupedResults.memories.length})
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {groupedResults.memories.map((memory) => (
                        <MemoryCard
                          key={memory.id}
                          memory={memory}
                          onClick={() => {
                            onMemoryClick(memory);
                          }}
                          onEdit={() => onEditMemory(memory)}
                          onDelete={() => onDeleteMemory(memory.id)}
                          onShareMemory={() => {
                            onShareMemory(memory);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {groupedResults.memories.length === 0 && !isSearching && (
                  <EmptyState
                    icon={MagnifyingGlass}
                    title="No results found"
                    description={(() => {
                      if (searchQuery.trim()) {
                        return `No memories found for "${searchQuery}". Try different keywords or check your spelling.`;
                      } else if (
                        endDate ||
                        startDate ||
                        selectedMoods.length > 0 ||
                        selectedTags.length > 0
                      ) {
                        return "No memories match your selected filters. Try adjusting them.";
                      } else {
                        return "Start searching or apply filters to find your memories.";
                      }
                    })()}
                  />
                )}
              </div>
            ) : (
              /* Search Suggestions */
              <div className="mt-8 space-y-8">
                {/* Recent Searches */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Searches
                  </h2>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(search)}
                        className="flex items-center space-x-3 p-3 w-full text-left hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <MagnifyingGlass className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-700">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-neutral-900 flex items-center">
                    <TagIcon className="w-5 h-5 mr-2" />
                    Popular Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.slice(0, 5).map((tag) => (
                      <Tag
                        key={tag}
                        className="cursor-pointer hover:bg-primary-200"
                        onClick={() => {
                          setSearchQuery(tag);
                        }}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* Search Tips */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                  <h3 className="font-semibold text-primary-900 mb-3">
                    Search Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-primary-800">
                    <li>
                      • Use quotes for exact phrases: &quot;family
                      vacation&quot;
                    </li>
                    <li>
                      • Search by date: &quot;2023&quot; or &quot;December&quot;
                    </li>
                    <li>
                      • Find by location: &quot;Paris&quot; or &quot;home&quot;
                    </li>
                    <li>
                      • Search by mood: &quot;joyful&quot; or
                      &quot;peaceful&quot;
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
