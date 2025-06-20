import {createSystem, defaultConfig, defineConfig, defineTextStyles,} from "@chakra-ui/react";
import {mode} from "@chakra-ui/theme-tools";
import {extendTheme} from "@chakra-ui/theme-utils";

export const textStyles = defineTextStyles({
    body: {
        description: "The body text style - used in paragraphs",
        value: {
            fontFamily: "Roboto, sans-serif",
            fontWeight: "500",
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "0",
            textDecoration: "None",
            textTransform: "None",
        },
    },
});

export const customConfig = defineConfig({
    theme: {
        config: {
            initialColorMode: "dark",
            useSystemColorMode: true,
            disableLayers: false,
        },
        textStyles,
        styles: {
            global: (props) => ({
                body: {
                    color: mode("gray.800", "whiteAlpha.900")(props),
                    bg: mode("gray.100", "#101010")(props),
                },
            }),
        },
        tokens: {
            colors: {
                gray: {
                    light: "#616161",
                    dark: "#1e1e1e",
                },
                base: {
                    white: "#ffffff",
                    black: "#000000",
                },
            },
        },
    },
});

export const system = createSystem(defaultConfig, customConfig);

export const theme = extendTheme({
    config: {
        initialColorMode: "dark",
        useSystemColorMode: true,
        disableLayers: false,
    },
    colors: {
        gray: {
            light: "#616161",
            dark: "#1e1e1e",
        },
        base: {
            white: "#ffffff",
            black: "#000000",
        },
    },
    styles: {
        global: (props) => ({
            body: {
                color: mode("gray.800", "whiteAlpha.900")(props),
                bg: mode("gray.100", "#101010")(props),
            },
        }),
    },
});
