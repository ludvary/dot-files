-- yaaay config file!  :)

-- define the statusline theme, lvim is trash, default is sick
lvim.builtin.lualine.style = "default"

-- donot highlight the line that the cursor is on
vim.wo.cursorline = false


-- to change comment color
-- vim.cmd([[highlight Comment guifg=#677475]])


-- i no longer want or need line numbers, i think without line numbers is cleaner
vim.cmd("set number!")
vim.cmd("set norelativenumber")

-- true colors
vim.o.termguicolors = true

-- line wraping
vim.o.wrap = true

-- autoindent
vim.o.autoindent = true

-- tabstop
vim.o.tabstop = 4

-- shiftwidth
vim.o.shiftwidth = 4

-- get rid of ugly indentlines
-- vim.cmd("IndentBlanklineDisable")
lvim.builtin.indentlines.active=false

-- to make bg transparent
function Make_transp()
  vim.api.nvim_set_hl(0, "Normal", { bg = "none" })
  vim.api.nvim_set_hl(0, "NormalFloat", { bg = "none" })
end


-- Set the background variable for gruvbox_material
vim.g.gruvbox_material_background = 'hard'
-- vim.g.gruvbox_material_foreground = 'original'


-- set the pdf reader for vim latex
-- vim.g.vimtex_view_general_viewer = 'okular'
vim.g.vimtex_view_general_viewer = 'zathura'

--- #### vimtex stuff
--" This is necessary for VimTeX to load properly. The "indent" is optional.
-- " Note: Most plugin managers will do this automatically!
--filetype plugin indent on

-- toggle diagnostics
vim.diagnostic.enable()
-- vim.diagnostic.disable()



lvim.plugins = {
  {"JuliaEditorSupport/julia-vim", lazy = false},
  { "rebelot/kanagawa.nvim", lazy = false},
  { "shatur/neovim-ayu", lazy = false },
  { "tanvirtin/monokai.nvim", lazy = false },
  { "aditya-azad/candle-grey", lazy = false },
  { "neanias/everforest-nvim", priority = 1000, lazy = false},
  { "olivercederborg/poimandres.nvim", lazy = false }, { "elvessousa/sobrio", lazy = false },
  { "projekt0n/github-nvim-theme", lazy = false },
  { "ramojus/mellifluous.nvim", lazy = false },
  { "nyoom-engineering/oxocarbon.nvim", lazy = false},
  { "yorickpeterse/vim-paper", lazy = false },
  { "n1ghtmare/noirblaze-vim", lazy = false },
  { "kadekillary/skull-vim", lazy = false },
  { "chriskempson/base16-vim", lazy = false },
  { "kvrohit/rasmus.nvim", lazy = false },
  { "NLKNguyen/papercolor-theme", lazy = false },
  { "bignimbus/pop-punk.vim", lazy = false },
  { "rose-pine/neovim", lazy = false },
  { "xiyaowong/transparent.nvim", lazy = false },
  {"lervag/vimtex", lazy = false},
  {"oxfist/night-owl.nvim", lazy = false},
  {"cranberry-clockworks/coal.nvim", lazy = false},
  {"nikolvs/vim-sunbather", lazy = false},
  {"widatama/vim-phoenix", lazy = false},
  {"ntk148v/komau.vim", lazy = false},
  {"ludvary/photon.vim", lazy = false},
  {"ludvary/sainnhe_gruvbox_brighter", lazy=false},
  -- {"axvr/photon.vim", lazy = false},
  -- {"morhetz/gruvbox", lazy=false},
    {
    'goolord/alpha-nvim',
    dependencies = { 'nvim-tree/nvim-web-devicons' },
    config = function ()
        require'alpha'.setup(require'alpha.themes.theta'.config)
    end
}, 
}

-- colorscheme at launch
-- vim.cmd("color gruvbox-material")
-- vim.cmd("color paper")
-- lvim.colorscheme = "gruvbox-material"
-- lvim.colorscheme = "sobrio"
lvim.colorscheme = "retrobox"


-- remaps
lvim.keys.normal_mode["|"] = ":vsplit<CR>"
lvim.keys.normal_mode["-"] = ":split<CR>"

local present, alpha = pcall(require, "alpha")
if not present then
  return
end

local header = {
  type = "text",
  val = {
    [[             o\             ]],
    [[   _________/__\__________  ]],
    [[  |                  - (  | ]],
    [[ ,'-.                 . `-| ]],
    [[(____".       ,-.    '   || ]],
    [[  |          /\,-\   ,-.  | ]],
    [[  |      ,-./     \ /'.-\ | ]],
    [[  |     /-.,\      /     \| ]],
    [[  |    /     \    ,-.     \ ]],
    [[  |___/_______\__/___\_____\]],
  },
  opts = {
    position = "center",
    hl = "Comment",
  },
}

local function getGreeting(name)
  local tableTime = os.date("*t")
  local hour = tableTime.hour
  local greetingsTable = {
    [1] = "  Good morning",
    [2] = "  Good afternoon",
    [3] = "  Good evening",
    [4] = "望 Good night",
  }
  local greetingIndex = 0
  if hour == 23 or hour < 7 then
    greetingIndex = 1
  elseif hour < 12 then
    greetingIndex = 2
  elseif hour >= 12 and hour < 18 then
    greetingIndex = 3
  elseif hour >= 18 and hour < 21 then
    greetingIndex = 4
  elseif hour >= 21 then
    greetingIndex = 1
  end
  return greetingsTable[greetingIndex] .. ", " .. name
end

local userName = "Fornax"
local greeting = getGreeting(userName)

local greetHeading = {
  type = "text",
  val = greeting,
  opts = {
    position = "center",
    hl = "String",
  },
}

local quote = "First, solve the problem. Then, write the code."

local quoteAuthor = "Mahamta Gandhi (probably, maybe)"
local fullQuote = quote .. "\n \n                  - " .. quoteAuthor

local fortune = {
  type = "text",
  val = fullQuote,
  opts = {
    position = "center",
    hl = "Comment",
  },
}

local function button(sc, txt, keybind)
  local sc_ = sc:gsub("%s", ""):gsub("SPC", "<leader>")

  local opts = {
    position = "center",
    text = txt,
    shortcut = sc,
    cursor = 6,
    width = 19,
    align_shortcut = "right",
    hl_shortcut = "Number",
    hl = "Function",
  }
  if keybind then
    opts.keymap = { "n", sc_, keybind, { noremap = true, silent = true } }
  end

  return {
    type = "button",
    val = txt,
    on_press = function()
      local key = vim.api.nvim_replace_termcodes(sc_, true, false, true)
      vim.api.nvim_feedkeys(key, "normal", false)
    end,
    opts = opts,
  }
end

local buttons = {
  type = "group",
  val = {
    button("s", "   Restore               ", ":SessionManager load_last_session<CR>"),
    button("r", "   Recents               ", ":Telescope oldfiles<CR>"),
    button("f", "   Search                ", ":Telescope find_files<CR>"),
    button("e", "   Create                ", ":ene <BAR> startinsert<CR>"),
    button("u", "   Update                ", ":Lazy sync<CR>"),
    button("c", "   Config                ", ":e ~/.config/nvim/<CR>"),
    button("q", "   Quit                  ", ":qa!<CR>"),
  },
  opts = {
    position = "center",
    spacing = 1,
  },
}

local section = {
  header = header,
  buttons = buttons,
  greetHeading = greetHeading,
  footer = fortune,
}

local opts = {
  layout = {
    { type = "padding", val = 3 },
    section.header,
    { type = "padding", val = 3 },
    section.greetHeading,
    { type = "padding", val = 2 },
    section.buttons,
    { type = "padding", val = 2 },
    section.footer,
  },
  opts = {
    margin = 44,
  },
}

alpha.setup(opts)
