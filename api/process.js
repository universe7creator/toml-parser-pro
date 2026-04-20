// TOML Parser Pro - Process endpoint
// Parses TOML to JSON/YAML with validation

const TOML = {
  parse: (str) => {
    const lines = str.split('\n');
    const result = {};
    let currentSection = result;
    const sectionStack = [];
    let currentTable = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;
      
      // Table: [section] or [[array]]
      if (line.startsWith('[')) {
        const isArray = line.startsWith('[[');
        const tableName = line.replace(/\[\[|\]\]|\[|\]/g, '');
        
        if (isArray) {
          if (!result[tableName]) result[tableName] = [];
          const obj = {};
          result[tableName].push(obj);
          currentSection = obj;
        } else {
          currentTable = tableName;
          const parts = tableName.split('.');
          let target = result;
          for (const part of parts) {
            if (!(part in target)) target[part] = {};
            target = target[part];
          }
          currentSection = target;
        }
        continue;
      }
      
      // Key-value pair
      const eqIndex = line.indexOf('=');
      if (eqIndex === -1) continue;
      
      const key = line.substring(0, eqIndex).trim();
      let value = line.substring(eqIndex + 1).trim();
      
      // Parse value
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        value = Number(value);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Array parsing
        try {
          value = JSON.parse(value);
        } catch {
          // Keep as string if JSON parse fails
        }
      }
      
      currentSection[key] = value;
    }
    
    return result;
  },
  
  toJSON: (obj) => JSON.stringify(obj, null, 2),
  
  toYAML: (obj) => {
    const convert = (obj, indent = 0) => {
      let yaml = '';
      const spaces = '  '.repeat(indent);
      
      for (const [key, val] of Object.entries(obj)) {
        if (val === null) {
          yaml += `${spaces}${key}: null\n`;
        } else if (typeof val === 'object' && !Array.isArray(val)) {
          yaml += `${spaces}${key}:\n`;
          yaml += convert(val, indent + 1);
        } else if (Array.isArray(val)) {
          yaml += `${spaces}${key}:\n`;
          for (const item of val) {
            if (typeof item === 'object') {
              yaml += `${spaces}  -\n`;
              yaml += convert(item, indent + 2).replace(/^/gm, '  ');
            } else {
              yaml += `${spaces}  - ${item}\n`;
            }
          }
        } else if (typeof val === 'string') {
          if (val.includes(':') || val.includes('\n') || val.includes('#')) {
            yaml += `${spaces}${key}: "${val.replace(/"/g, '\\"')}"\n`;
          } else {
            yaml += `${spaces}${key}: ${val}\n`;
          }
        } else {
          yaml += `${spaces}${key}: ${val}\n`;
        }
      }
      return yaml;
    };
    return convert(obj);
  }
};

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const { toml, format = 'json' } = req.body || {};
    
    if (!toml) {
      res.status(400).json({ error: 'TOML content is required' });
      return;
    }
    
    // Parse TOML
    const parsed = TOML.parse(toml);
    
    // Convert to requested format
    let output;
    let contentType;
    
    if (format === 'yaml' || format === 'yml') {
      output = TOML.toYAML(parsed);
      contentType = 'application/x-yaml';
    } else {
      output = TOML.toJSON(parsed);
      contentType = 'application/json';
    }
    
    res.status(200).json({
      success: true,
      format: format,
      result: format === 'json' ? parsed : output,
      json_output: format !== 'json' ? parsed : undefined
    });
    
  } catch (error) {
    res.status(400).json({
      error: 'Parse error',
      message: error.message,
      line: error.line || null
    });
  }
};
