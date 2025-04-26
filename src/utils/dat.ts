  // Format the timestamp more nicely
  export const formatDate = (key: Deno.KvKey) => {
    try {
      if (!Array.isArray(key) || key.length === 0) {
        return "Unknown date";
      }
      
      // The timestamp should be the last element in the key array
      const timestamp = key[key.length - 1];
      
      if (typeof timestamp === 'string' && timestamp.includes('T')) {
        const date = new Date(timestamp);
        return date.toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      
      // Fallback to a simpler format if not a valid ISO date string
      return String(timestamp);
    } catch (e) {
      return "Invalid date";
    }
  };
