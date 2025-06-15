import { useState } from "react";

import { v4 as uuidv4 } from "uuid";

import Alert from "@mui/material/Alert/Alert";
import Box from "@mui/material/Box/Box";
import Container from "@mui/material/Container/Container";
import Stack from "@mui/material/Stack/Stack";
import TextField from "@mui/material/TextField/TextField";

import { QueryPattern } from "@worm/types/src/replace";
import { Matcher } from "@worm/types/src/rules";
import { SchemaExport } from "@worm/types/src/storage";

import Button from "../components/button/Button";

interface FoxReplaceExport {
  version: string;
  groups: FoxReplaceExportGroup[];
}

interface FoxReplaceExportGroup {
  enabled: boolean;
  html: "inputoutput" | "output" | "none";
  mode: FoxReplaceGroupMode;
  name: string;
  substitutions: FoxReplaceSubstitution[];
  urls: string[];
}

interface FoxReplaceSubstitution {
  caseSensitive: boolean;
  input: string;
  inputType: FoxReplaceSubstitutionType;
  output: string;
  outputType: FoxReplaceSubstitutionType;
}

interface MigratorFormData {
  error: string;
  input: string;
  output: string;
}

type FoxReplaceGroupMode = "auto" | "auto&manual" | "manual";

type FoxReplaceSubstitutionType = "regexp" | "text" | "wholewords";

const defaultFormData: MigratorFormData = {
  error: "",
  input: "",
  output: "",
};

const foxReplaceQueryPatternMapping: Record<
  FoxReplaceSubstitutionType,
  QueryPattern
> = {
  regexp: "regex",
  text: "default",
  wholewords: "wholeWord",
};

function convert(input: string): Pick<MigratorFormData, "error" | "output"> {
  let error = "",
    output = "";

  try {
    const inputJson: FoxReplaceExport = JSON.parse(input);
    const wrmOutput: SchemaExport = {
      version: 1,
      data: {
        matchers: [],
      },
    };

    for (const group of inputJson.groups) {
      const { substitutions } = group;

      for (const substitution of substitutions) {
        const newMatcher: Matcher = {
          active: true,
          identifier: uuidv4(),
          queries: [substitution.input],
          queryPatterns: [],
          replacement: substitution.output,
        };

        if (substitution.caseSensitive) {
          newMatcher.queryPatterns.push("case");
        }

        switch (substitution.inputType) {
          case "regexp":
          case "wholewords":
            newMatcher.queryPatterns.push(
              foxReplaceQueryPatternMapping[substitution.inputType]
            );
            break;

          default:
            if (newMatcher.queryPatterns.length === 0) {
              newMatcher.queryPatterns.push("default");
            }
        }

        wrmOutput.data?.matchers?.push(newMatcher);
      }
    }

    output = JSON.stringify(wrmOutput);
  } catch (e) {
    console.error("Error converting", e);

    error =
      e instanceof Error
        ? e.message
        : "Something went wrong, check the console";
  }

  return {
    error,
    output,
  };
}

export default function ImportMigratorPage() {
  const [formData, setFormData] = useState<MigratorFormData>(defaultFormData);

  const handleDownloadClick = () => {
    const href = `data:text/json;charset=utf-8,${encodeURIComponent(
      formData.output
    )}`;
    const anchor = document.createElement("a");
    const filename = `WordReplacerMax_Rules_${new Date().getTime()}.json`;

    anchor.setAttribute("href", href);
    anchor.setAttribute("download", filename);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormData({
      ...formData,
      ...convert(formData.input),
    });
  };

  return (
    <>
      <Container sx={{ py: 4 }}>
        <h1>FoxReplace Migrator</h1>
        <p>
          Use the form below to translate FoxReplace exports to Word Replacer
          Max.
        </p>
        <Box sx={{ py: 3 }}>
          <form onSubmit={handleFormSubmit}>
            <Stack gap={2}>
              <TextField
                fullWidth
                multiline
                name="input"
                placeholder="Paste your FoxReplace export JSON here"
                rows={8}
                value={formData.input}
                onChange={handleInputChange}
              />
              {formData.error && (
                <Alert severity="error">{formData.error}</Alert>
              )}
              <Button disabled={!formData.input} type="submit">
                Convert
              </Button>
              <TextField
                disabled
                fullWidth
                label="Output"
                multiline
                name="output"
                rows={8}
                value={formData.output}
                onChange={handleInputChange}
              />
              <Button disabled={!formData.output} onClick={handleDownloadClick}>
                Download
              </Button>
            </Stack>
          </form>
        </Box>
      </Container>
    </>
  );
}
