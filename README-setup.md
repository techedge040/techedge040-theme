# Shopify Theme Development Workspace

Deze workspace is ingericht voor Shopify theme ontwikkeling met de Shopify CLI en de Shopify AI-toolkit.

## Wat is er aanwezig

- De workspace root bevat nu de lokale fork van Shopify Horizon.
- `.vscode/` — VS Code instellingen en taken voor thema-ontwikkeling.

## Belangrijke commando's

- Start de lokale themaserver:
  ```powershell
  shopify theme serve --path .
  ```

- Theme bestanden naar de winkel pushen:
  ```powershell
  shopify theme push --path .
  ```

- Theme bestanden van de winkel ophalen:
  ```powershell
  shopify theme pull --path .
  ```

- Log in op je Shopify-winkel:
  ```powershell
  shopify login --store <your-store>.myshopify.com
  ```

## VS Code taken

Open de Command Palette en kies `Tasks: Run Task` voor:

- `Shopify CLI: Login`
- `Shopify Theme: Serve`
- `Shopify Theme: Push`
- `Shopify Theme: Pull`

## Aanvullende setup

- Zorg dat je ingelogd bent met `shopify login`.
- Vervang `<your-store>` door je eigen winkelnaam.
- Gebruik `shopify theme language-server` in combinatie met Liquid/HTML syntax-highlighting als je extra editor support wilt.
