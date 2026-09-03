import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/Icons'
import { getListWithSongs, removeSongFromList, moveListSong, renameList } from '../lib/store'

export default function ListDetail() {
  const { id } = useParams()
  const [list, setList] = useState(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')

  const load = () => getListWithSongs(id).then(setList)

  useEffect(() => {
    load()
  }, [id])

  const remove = async (item) => {
    await removeSongFromList(item.id)
    load()
  }

  const move = async (item, dir) => {
    try {
      await moveListSong(item.id, dir)
      load()
    } catch {}
  }

  const saveName = async () => {
    const n = name.trim()
    if (n) await renameList(id, n)
    setEditing(false)
    load()
  }

  if (!list) return <div className="page center-page">Carregando...</div>

  const items = list.items || []

  return (
    <div className="page">
      <header className="page-head row-space">
        <div className="grow">
          {editing ? (
            <div className="row">
              <input className="grow" value={name} onChange={(e) => setName(e.target.value)} />
              <button className="btn btn-primary sm-btn" onClick={saveName}>Salvar</button>
            </div>
          ) : (
            <h1 onClick={() => { setName(list.name); setEditing(true) }}>{list.name}</h1>
          )}
          <p className="muted">
            {items.length} {items.length === 1 ? 'música' : 'músicas'}
          </p>
        </div>
        <button className="icon-btn" onClick={() => { setName(list.name); setEditing(true) }} aria-label="Renomear lista">
          <Icon name="edit" size={18} />
        </button>
      </header>

      <div className="stack">
        {items.length === 0 && (
          <div className="empty-state">
            <Icon name="list" size={34} />
            <p className="muted">
              Lista vazia. Toque no <b>+</b> dentro de uma cifra para adicionar.
            </p>
          </div>
        )}
        {items.map((item, idx) => (
          <div key={item.id} className="setlist-row">
            <span className="setlist-index">{idx + 1}</span>
            <Link className="song-card grow" to={`/song/${item.song.id}`}>
              <div className="song-card-art small">
                {item.song.image_url ? (
                  <img src={item.song.image_url} alt="" loading="lazy" />
                ) : (
                  <span className="song-card-art-letter">{(item.song.artist || '?')[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="song-card-body">
                <strong className="song-card-title">{item.song.title}</strong>
                <span className="song-card-artist">{item.song.artist}</span>
              </div>
            </Link>
            <div className="col-actions">
              <button className="icon-btn sm" disabled={idx === 0} onClick={() => move(item, -1)} aria-label="Subir">
                <Icon name="up" size={16} />
              </button>
              <button
                className="icon-btn sm"
                disabled={idx === items.length - 1}
                onClick={() => move(item, 1)}
                aria-label="Descer"
              >
                <Icon name="down" size={16} />
              </button>
              <button className="icon-btn sm" onClick={() => remove(item)} aria-label="Remover da lista">
                <Icon name="trash" size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
