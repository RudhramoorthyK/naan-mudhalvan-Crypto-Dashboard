
import { useState, useRef, useEffect } from "react";
import { CryptoAsset } from "@/types/crypto";
import { Search, X } from "lucide-react";

interface CryptoSearchProps {
  assets: CryptoAsset[];
  onSelect: (asset: CryptoAsset) => void;
}

export function CryptoSearch({ assets, onSelect }: CryptoSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const filteredAssets = query.length > 0
    ? assets.filter(
        asset => 
          asset.name.toLowerCase().includes(query.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(query.toLowerCase())
      )
    : [];
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleSelect = (asset: CryptoAsset) => {
    onSelect(asset);
    setQuery("");
    setIsOpen(false);
  };
  
  return (
    <div className="relative w-full max-w-sm" ref={inputRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-muted-foreground" />
        </div>
        <input
          type="search"
          className="block w-full p-3 pl-10 text-sm text-foreground bg-secondary/30 
                   border border-transparent rounded-lg focus:ring-primary/10 focus:border-primary/20
                   focus:outline-none transition-all duration-200"
          placeholder="Search cryptocurrencies..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X size={16} className="text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      
      {isOpen && filteredAssets.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-lg shadow-lg animate-slide-up overflow-hidden">
          <ul className="py-1 max-h-60 overflow-y-auto">
            {filteredAssets.map((asset) => (
              <li key={asset.id}>
                <button
                  className="flex items-center w-full px-4 py-2 text-left hover:bg-secondary/50 transition-colors"
                  onClick={() => handleSelect(asset)}
                >
                  {asset.image && (
                    <img 
                      src={asset.image} 
                      alt={asset.name} 
                      className="w-6 h-6 mr-3"
                      loading="lazy"
                    />
                  )}
                  <span className="font-medium">{asset.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {asset.symbol.toUpperCase()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
