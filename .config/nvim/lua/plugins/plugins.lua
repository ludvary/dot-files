return {
  { "ellisonleao/gruvbox.nvim", priority = 1000, palette_overriders = { dark0_hard = "#1d2021" } },
  { "rebelot/kanagawa.nvim" },
  { "shatur/neovim-ayu" },
  { "tanvirtin/monokai.nvim" },
  { "aditya-azad/candle-grey" },
  { "neanias/everforest-nvim", priority = 1000, lazy = false},
  { "olivercederborg/poimandres.nvim" },
  { "elvessousa/sobrio" },
  { "projekt0n/github-nvim-theme" },
  -- { "mcchrish/zenbones.nvim" },
  { "ramojus/mellifluous.nvim" },
  { "nyoom-engineering/oxocarbon.nvim" },
  { "yorickpeterse/vim-paper" },
  { "n1ghtmare/noirblaze-vim" },
  { "kadekillary/skull-vim" },
  { "chriskempson/base16-vim" },
  { "kvrohit/rasmus.nvim" },
  { "morhetz/gruvbox" },
  { "NLKNguyen/papercolor-theme" },
  { "bignimbus/pop-punk.vim" },
  { "rose-pine/neovim" },
  {"itchyny/lightline.vim",lazy = false, priority = 1000},

-- plugin for tabline
  {'romgrk/barbar.nvim',
    dependencies = {
      'lewis6991/gitsigns.nvim', -- OPTIONAL: for git status
      'nvim-tree/nvim-web-devicons', -- OPTIONAL: for file icons
    },
    init = function() vim.g.barbar_auto_setup = false end,
    opts = {
      -- lazy.nvim will automatically call setup for you. put your options here, anything missing will use the default:
      -- animation = true,
      -- insert_at_start = true,
      -- …etc.
    },
    lazy = false,
    version = '^1.0.0', -- optional: only update when a new 1.x version is released
  },
}

