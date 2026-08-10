import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { moviesAPI, theatersAPI } from "../services/api"
import type { Theater } from "../types"
import { useAuth } from "../context/useAuth"
import "./Header.css"

const Header = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const location = useLocation()

  const navigate = useNavigate()

  const [suggestions, setSuggestions] = useState<{ MovieId: number; Title: string; PosterUrl?: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ left: number; top: number; width: number } | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchTerm.trim()
    if (q === "") return
    // Navigate to movies page with query param so Enter submits a search
    navigate(`/movies?q=${encodeURIComponent(q)}`)
  }

  // debounce fetch suggestions
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      setHighlight(-1)
      return
    }

    const id = setTimeout(async () => {
      try {
        setLoadingSuggestions(true)
        const res = await moviesAPI.search(searchTerm.trim())
        console.log('[Header] autocomplete search', { term: searchTerm.trim(), results: Array.isArray(res) ? res.length : typeof res })
        const list = Array.isArray(res)
          ? (res as any[]).slice(0, 6).map((m) => ({
              MovieId: m.MovieId ?? m.movieId ?? 0,
              Title: m.Title ?? m.title ?? String(m),
              PosterUrl: m.PosterUrl ?? m.posterUrl ?? (m.poster?.url ?? ""),
            }))
          : []
        setSuggestions(list)
        console.log('[Header] suggestions', list)
        setShowSuggestions(true)
        if (inputRef.current) {
          const r = inputRef.current.getBoundingClientRect()
          setDropdownPos({ left: r.left, top: r.bottom + 8, width: r.width })
        }
        setHighlight(-1)
      } catch (err) {
        console.error('[Header] autocomplete error', err)
        setSuggestions([])
        setShowSuggestions(true)
        setHighlight(-1)
      } finally {
        setLoadingSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(id)
  }, [searchTerm])

  // keep dropdown aligned on resize/scroll
  useEffect(() => {
    const upd = () => {
      if (!inputRef.current || !showSuggestions) return
      const r = inputRef.current.getBoundingClientRect()
      setDropdownPos({ left: r.left, top: r.bottom + 8, width: r.width })
    }
    window.addEventListener('resize', upd)
    window.addEventListener('scroll', upd, true)
    return () => {
      window.removeEventListener('resize', upd)
      window.removeEventListener('scroll', upd, true)
    }
  }, [showSuggestions])

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === "Enter") {
      if (highlight >= 0 && suggestions[highlight]) {
        const sel = suggestions[highlight]
        navigate(`/movies?q=${encodeURIComponent(sel.Title)}`)
        setShowSuggestions(false)
        setSearchTerm("")
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const { user, isLoggedIn, logout } = useAuth()

  const [showTheaterMenu, setShowTheaterMenu] = useState(false)
  const [theaters, setTheaters] = useState<Theater[]>([])
  const closeTimerRef = useRef<number | null>(null)
  const [loadingTheatersMobile, setLoadingTheatersMobile] = useState(false)
  const isMountedRef = useRef(true)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)
  const hamburgerRef = useRef<HTMLButtonElement | null>(null)

  const handleLogout = () => {
    setUserMenuOpen(false)
    logout()
    navigate("/")
  }

  const toggleMobileMenu = () => setMobileMenuOpen((s) => !s)
  const toggleUserMenu = () => setUserMenuOpen((s) => !s)

  // fetch theaters on-demand when opening the mobile menu if not already loaded
  const fetchTheatersIfNeeded = async () => {
    if ((theaters && theaters.length > 0) || loadingTheatersMobile) return
    setLoadingTheatersMobile(true)
    try {
      const list = await theatersAPI.list()
      if (!isMountedRef.current) return
      setTheaters(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Error fetching theaters for mobile menu', err)
    } finally {
      if (isMountedRef.current) setLoadingTheatersMobile(false)
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    const handleDocClick = (e: MouseEvent) => {
      // if click is inside authenticated user menu, ignore
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return
      // if click is inside mobile menu, ignore (so link clicks register)
      if (mobileMenuRef.current && mobileMenuRef.current.contains(e.target as Node)) return
      // if click is inside search input, don't close menu
      if (inputRef.current && inputRef.current.contains(e.target as Node)) return
      setMobileMenuOpen(false)
      setUserMenuOpen(false)
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false)
        setUserMenuOpen(false)
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleDocClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleDocClick)
      document.removeEventListener("keydown", handleKey)
      isMountedRef.current = false
    }
  }, [])

  // Manage focus and inertness when mobile menu opens/closes to avoid
  // "aria-hidden on an element because its descendant retained focus" warnings.
  useEffect(() => {
    const menuEl = mobileMenuRef.current
    if (!menuEl) return

    // When opening, remove inert so it is focusable, and optionally focus first item
    if (mobileMenuOpen) {
      try { menuEl.removeAttribute('inert') } catch (e) { /* ignore */ }
      const first = menuEl.querySelector<HTMLElement>('a,button')
      if (first) {
        // focus the first interactive element so keyboard users land inside menu
        first.focus()
      }
    } else {
      // When closing, if focus is inside the menu move it back to the hamburger
      try { menuEl.setAttribute('inert', '') } catch (e) { /* ignore */ }
      const active = document.activeElement as HTMLElement | null
      if (active && menuEl.contains(active)) {
        // move focus back to hamburger to avoid aria-hidden hiding focused element
        try { hamburgerRef.current?.focus() } catch (e) { /* ignore */ }
      }
    }
  }, [mobileMenuOpen])

  // fetch theaters for dropdown
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const list = await theatersAPI.list()
        if (!mounted) return
        setTheaters(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Error loading theaters for header dropdown', err)
      }
    })()

    return () => { mounted = false }
  }, [])

  return (
    <>
      {/* khoảng trắng phía trên */}
      {/* <div className="header-top-space"></div> */}

      {/* header chính */}
      <header className="header">
        <Link
          to="/"
          className="logo"
          onClick={(e) => {
            if (location.pathname === "/") {
              // already on home — scroll to top
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
        >
          🎥 CINEMAX
        </Link>

        <nav className="nav">
          <Link
            to="/"
            className={location.pathname === "/" ? "active" : ""}
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            Trang chủ
          </Link>

          <Link
            to="/movies"
            className={location.pathname === "/movies" ? "active" : ""}
            onClick={(e) => {
              if (location.pathname === "/movies") {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            Phim
          </Link>

          <div
            className="theater-dropdown"
            onMouseEnter={() => {
              if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current)
                closeTimerRef.current = null
              }
              setShowTheaterMenu(true)
            }}
            onMouseLeave={() => {
              // small delay to allow moving pointer into the menu without closing
              if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
              closeTimerRef.current = window.setTimeout(() => {
                setShowTheaterMenu(false)
                closeTimerRef.current = null
              }, 220)
            }}
          >
            <a
              href="#"
              className={location.pathname === "/theaters" ? "active theater-toggle" : "theater-toggle"}
              onClick={(e) => {
                e.preventDefault()
                // preserve existing behavior: open theaters page
                navigate('/theaters')
              }}
            >
              Rạp
              <span className="chev" aria-hidden>▾</span>
            </a>

            {/** Hover/click menu - populated from API grouped by city */}
            {showTheaterMenu && (
              <div className="theater-menu" role="menu" aria-label="Chọn rạp theo tỉnh thành">
                <div className="theater-menu-scroll">
                  {(() => {
                    // group theaters by city
                    const groups: Record<string, Theater[]> = {}
                    theaters.forEach((t) => {
                      const city = (t.city ?? (t as any).City ?? 'Khác') as string
                      if (!groups[city]) groups[city] = []
                      groups[city].push(t)
                    })

                    // Flatten: show theaters directly (no city grouping)
                    if (!theaters || theaters.length === 0) {
                      return (
                        <div className="theater-menu-list">
                          {['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'].map((c) => (
                            <button key={c} className="theater-menu-item" onClick={() => { navigate(`/theaters?city=${encodeURIComponent(c)}`); setShowTheaterMenu(false) }} role="menuitem">{c}<span className="item-chevron">›</span></button>
                          ))}
                        </div>
                      )
                    }

                    return (
                      <div className="theater-menu-list">
                        {theaters.map((t) => {
                          const id = (t as any).theaterId ?? (t as any).TheaterId ?? (t as any).id
                          const name = (t as any).name ?? (t as any).Name ?? (t as any).theaterCode ?? (t as any).TheaterCode ?? `Rạp ${id}`
                          const city = (t as any).city ?? (t as any).City ?? ''
                          return (
                            <button
                              key={id}
                              className="theater-menu-item"
                              onClick={() => {
                                if (closeTimerRef.current) {
                                  clearTimeout(closeTimerRef.current)
                                  closeTimerRef.current = null
                                }
                                setShowTheaterMenu(false)
                                navigate(`/theaters?theaterId=${id}`)
                              }}
                              role="menuitem"
                            >
                              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                <span style={{fontWeight: 700}}>{name}</span>
                                {city ? <small style={{color: '#6b7280'}}>{city}</small> : null}
                              </div>
                              <span className="item-chevron">›</span>
                            </button>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/price"
            className={location.pathname === "/price" ? "active" : ""}
            onClick={(e) => {
              if (location.pathname === "/price") {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            Giá vé
          </Link>

          <Link
            to="/news"
            className={location.pathname === "/news" ? "active" : ""}
            onClick={(e) => {
              if (location.pathname === "/news") {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            Lịch sử
          </Link>
        </nav>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm phim..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true) }}
            onKeyDown={handleInputKeyDown}
            onFocus={() => { if (suggestions.length) setShowSuggestions(true) }}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
          />
          <button type="submit">🔍</button>

          {showSuggestions && (
            // render dropdown using fixed positioning to avoid clipping/overflow issues
            <div
              id="search-suggestions"
              className="search-suggestions"
              role="listbox"
              style={dropdownPos ? { position: 'fixed', left: dropdownPos.left, top: dropdownPos.top, width: dropdownPos.width, zIndex: 10000 } : {}}
            >
              {loadingSuggestions ? (
                <div className="suggestion-item" style={{ justifyContent: 'center' }}>
                  <div style={{ color: '#6b7280' }}>Đang tìm...</div>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="suggestion-item" style={{ justifyContent: 'center' }}>
                  <div style={{ color: '#6b7280' }}>Không có gợi ý</div>
                </div>
              ) : (
                suggestions.map((s, idx) => (
                  <div
                    key={s.MovieId || `${s.Title}-${idx}`}
                    onMouseDown={(ev) => { ev.preventDefault(); navigate(`/movies?q=${encodeURIComponent(s.Title)}`); setShowSuggestions(false); setSearchTerm("") }}
                    onMouseEnter={() => setHighlight(idx)}
                    className={`suggestion-item ${highlight === idx ? 'highlight' : ''}`}
                    role="option"
                    aria-selected={highlight === idx}
                  >
                    {s.PosterUrl ? (
                      <img src={s.PosterUrl} alt={s.Title} className="suggestion-thumb" />
                    ) : (
                      <div className="suggestion-thumb placeholder" />
                    )}
                    <div className="suggestion-title">{s.Title}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </form>

        {/* mobile hamburger - visible via CSS on small screens */}
        <button
          className="hamburger"
          ref={hamburgerRef}
          aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={mobileMenuOpen}
          onClick={(e) => { e.preventDefault(); toggleMobileMenu() }}
        >
          <span className="hamburger-box">
            <span className={`hamburger-inner ${mobileMenuOpen ? 'open' : ''}`} />
          </span>
        </button>

        <div className="auth-buttons">
          {isLoggedIn && user ? (
            <div className="auth-user" ref={menuRef}>
              <button type="button" className="greeting-btn" onClick={toggleUserMenu} aria-haspopup="true" aria-expanded={userMenuOpen}>
                Xin chào: {user.fullName ?? user.userName}
              </button>

              {userMenuOpen && (
                <div className="user-dropdown" role="menu">
                  <button className="dropdown-item" onClick={handleLogout} role="menuitem">
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Đăng nhập/ Đăng ký
            </Link>
          )}
        </div>

        {/* Mobile menu panel (visible on small viewports) */}
        <div ref={mobileMenuRef} className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} role="menu" aria-hidden={!mobileMenuOpen}>
          <nav className="mobile-nav">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Trang chủ</Link>
            <Link to="/movies" onClick={() => setMobileMenuOpen(false)}>Phim</Link>
            <Link to="/price" onClick={() => setMobileMenuOpen(false)}>Giá vé</Link>
            <Link to="/news" onClick={() => setMobileMenuOpen(false)}>Lịch sử</Link>

            <div className="mobile-theaters">
              <div style={{ fontWeight: 800, marginTop: 8, marginBottom: 6 }}>Chọn rạp</div>
              {(() => {
                if (mobileMenuOpen && (!theaters || theaters.length === 0) && !loadingTheatersMobile) {
                  fetchTheatersIfNeeded()
                }

                if (loadingTheatersMobile) {
                  return <div style={{ color: '#cbd5e1' }}>Đang tải...</div>
                }

                if (theaters && theaters.length > 0) {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {theaters.map((t) => {
                        const id = (t as any).theaterId ?? (t as any).TheaterId ?? (t as any).id
                        const name = (t as any).name ?? (t as any).Name ?? (t as any).theaterCode ?? (t as any).TheaterCode ?? `Rạp ${id}`
                        const city = (t as any).city ?? (t as any).City ?? ''
                        return (
                          <button
                            key={id}
                            className="mobile-theater-item"
                            onClick={() => { setMobileMenuOpen(false); navigate(`/theaters?theaterId=${id}`) }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                              <span style={{ fontWeight: 700 }}>{name}</span>
                              {city ? <small style={{ color: '#cbd5e1' }}>{city}</small> : null}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                }

                // fallback: show popular cities
                // return (
                //   <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                //     {['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'].map((c) => (
                //       <button key={c} className="mobile-theater-item" onClick={() => { setMobileMenuOpen(false); navigate(`/theaters?city=${encodeURIComponent(c)}`) }}>{c}</button>
                //     ))}
                //   </div>
                // )
              })()}
            </div>

            {isLoggedIn ? (
              <button className="mobile-logout" onClick={() => { handleLogout(); setMobileMenuOpen(false) }}>Đăng xuất</button>
            ) : (
              <div className="mobile-auth">
                <Link to="/login" className="mobile-login-btn" onClick={() => setMobileMenuOpen(false)}>
                  Đăng nhập / Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  )
}

export default Header


