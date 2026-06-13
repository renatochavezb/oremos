"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";
import toast from "react-hot-toast";
import { createRipple } from "@/libs/ripple";

function PrivateGroupsContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [groupPrayers, setGroupPrayers] = useState({});

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [inviteEmails, setInviteEmails] = useState({});
  const [joinCode, setJoinCode] = useState(searchParams.get("code") || "");

  const fetchGroups = useCallback(async () => {
    try {
      const response = await axios.get("/api/groups/private");
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error("Error fetching private groups:", error);
      toast.error("No se pudieron cargar tus grupos privados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      fetchGroups();
    } else {
      setLoading(false);
    }
  }, [session, status, fetchGroups]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("El nombre del grupo es requerido");
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post("/api/groups/private", {
        name: newName.trim(),
        description: newDescription.trim(),
      });
      setGroups((prev) => [response.data.group, ...prev]);
      setNewName("");
      setNewDescription("");
      toast.success("Grupo creado. Invita a tus contactos.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al crear el grupo");
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async (groupId) => {
    const emails = inviteEmails[groupId];
    if (!emails?.trim()) {
      toast.error("Escribe al menos un correo");
      return;
    }

    try {
      const response = await axios.post("/api/groups/private/invite", {
        groupId,
        emails,
      });
      const { added, pending, skipped } = response.data;
      toast.success(
        `Invitaciones enviadas: ${added + pending}${skipped ? ` (${skipped} omitidos)` : ""}`
      );
      setInviteEmails((prev) => ({ ...prev, [groupId]: "" }));
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al invitar contactos");
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setJoining(true);
    try {
      const response = await axios.post("/api/groups/private/join", {
        inviteCode: joinCode.trim(),
      });
      toast.success(
        response.data.alreadyMember
          ? "Ya formas parte de este grupo"
          : "Te uniste al grupo privado"
      );
      setJoinCode("");
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo unir al grupo");
    } finally {
      setJoining(false);
    }
  };

  const copyInviteLink = (inviteCode) => {
    const link = `${window.location.origin}/grupos-privados?code=${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace de invitación copiado");
  };

  const loadGroupPrayers = async (groupId) => {
    if (groupPrayers[groupId]) {
      setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
      return;
    }

    try {
      const response = await axios.get(`/api/groups/private/${groupId}/prayers`);
      setGroupPrayers((prev) => ({ ...prev, [groupId]: response.data.prayers || [] }));
      setExpandedGroupId(groupId);
    } catch (error) {
      toast.error("No se pudieron cargar las peticiones del grupo");
    }
  };

  const handleAmen = async (groupId, prayerId) => {
    try {
      const response = await axios.post(`/api/prayers/${prayerId}/amen`);
      setGroupPrayers((prev) => ({
        ...prev,
        [groupId]: prev[groupId].map((prayer) =>
          prayer.id === prayerId
            ? { ...prayer, prayersCount: response.data.prayersCount }
            : prayer
        ),
      }));
      toast.success("Te uniste en oración");
    } catch (error) {
      toast.error(error.response?.data?.error || "Error al unirte en oración");
    }
  };

  if (status === "unauthenticated") {
    return (
      <main className="max-w-4xl mx-auto px-6 py-24 text-center font-sans">
        <div className="bg-base-100 rounded-3xl p-12 shadow-sm border border-base-content/5 max-w-xl mx-auto">
          <span className="material-symbols-outlined text-[64px] text-secondary mb-6">groups</span>
          <h1 className="font-display text-3xl text-primary mb-4 font-medium">Grupos Privados</h1>
          <p className="text-base-content/70 text-sm mb-8 leading-relaxed">
            Crea círculos de oración e invita solo a quienes elijas. Comparte peticiones en confianza con tu familia, amigos o comunidad cercana.
          </p>
          <button
            onClick={() => signIn(undefined, { callbackUrl: "/grupos-privados" })}
            className="bg-primary text-primary-content hover:bg-primary/95 px-8 py-3 rounded-full font-bold shadow-md cursor-pointer inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">login</span>
            Iniciar Sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20 font-sans">
      <section className="mb-12 text-center">
        <span className="inline-block px-3 py-1 mb-4 bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider rounded-full">
          Premium
        </span>
        <h1 className="font-display text-4xl text-primary mb-4 font-medium">Grupos Privados</h1>
        <p className="text-base-content/70 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Arma círculos de confianza e invita contactos por correo o enlace. Las peticiones compartidas aquí solo las ven los miembros del grupo.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <form
          onSubmit={handleCreateGroup}
          className="bg-base-100 rounded-3xl border border-base-content/5 p-8 shadow-sm"
        >
          <h2 className="font-display text-xl text-primary mb-6">Crear grupo</h2>
          <div className="space-y-4">
            <div>
              <label className="label py-1">
                <span className="label-text font-semibold">Nombre del círculo</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Familia, Célula, Amigos cercanos"
                className="input input-bordered w-full"
                maxLength={80}
              />
            </div>
            <div>
              <label className="label py-1">
                <span className="label-text font-semibold">Descripción (opcional)</span>
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Un espacio para orar juntos en confianza"
                className="textarea textarea-bordered w-full"
                rows={3}
                maxLength={300}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="btn btn-primary w-full rounded-full font-bold"
            >
              {creating ? <span className="loading loading-spinner loading-sm" /> : "Crear grupo privado"}
            </button>
          </div>
        </form>

        <form
          onSubmit={handleJoin}
          className="bg-base-100 rounded-3xl border border-base-content/5 p-8 shadow-sm"
        >
          <h2 className="font-display text-xl text-primary mb-6">Unirse con código</h2>
          <p className="text-sm text-base-content/65 mb-4 leading-relaxed">
            Si alguien te invitó, pega el código o abre el enlace que te compartieron.
          </p>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="CÓDIGO DE INVITACIÓN"
            className="input input-bordered w-full uppercase tracking-widest text-center font-bold mb-4"
          />
          <button
            type="submit"
            disabled={joining}
            className="btn btn-outline btn-primary w-full rounded-full font-bold"
          >
            {joining ? <span className="loading loading-spinner loading-sm" /> : "Unirme al grupo"}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 bg-base-100 rounded-3xl border border-base-content/5">
          <span className="material-symbols-outlined text-5xl text-base-content/30 mb-4">group_off</span>
          <p className="text-base-content/60 mb-4">Aún no tienes grupos privados.</p>
          <p className="text-sm text-base-content/50">Crea uno arriba o únete con un código de invitación.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="font-display text-2xl text-primary">Mis círculos ({groups.length})</h2>
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-base-100 rounded-3xl border border-base-content/5 p-6 md:p-8 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-base-content">{group.name}</h3>
                    {group.isOwner && (
                      <span className="badge badge-secondary badge-sm">Creador</span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-base-content/65">{group.description}</p>
                  )}
                  <p className="text-xs text-base-content/45 mt-2">
                    {group.memberCount} miembro{group.memberCount !== 1 ? "s" : ""}
                    {group.pendingCount > 0 && ` · ${group.pendingCount} invitación${group.pendingCount !== 1 ? "es" : ""} pendiente${group.pendingCount !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyInviteLink(group.inviteCode)}
                    className="btn btn-sm btn-outline rounded-full"
                  >
                    Copiar enlace
                  </button>
                  <Link
                    href={`/nueva-peticion?group=${group.id}`}
                    className="btn btn-sm btn-primary rounded-full"
                  >
                    Pedir oración
                  </Link>
                </div>
              </div>

              {group.isOwner && (
                <div className="mb-6 p-4 rounded-2xl bg-secondary/5 border border-secondary/10">
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">
                    Invitar contactos
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={inviteEmails[group.id] || ""}
                      onChange={(e) =>
                        setInviteEmails((prev) => ({
                          ...prev,
                          [group.id]: e.target.value,
                        }))
                      }
                      placeholder="correo1@ejemplo.com, correo2@ejemplo.com"
                      className="input input-bordered input-sm flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleInvite(group.id)}
                      className="btn btn-sm btn-secondary rounded-full shrink-0"
                    >
                      Enviar invitación
                    </button>
                  </div>
                  <p className="text-[11px] text-base-content/50 mt-2">
                    Código: <span className="font-mono font-bold">{group.inviteCode}</span> — comparte el enlace o el código.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  createRipple(e, e.currentTarget);
                  loadGroupPrayers(group.id);
                }}
                className="text-sm font-bold text-primary hover:underline"
              >
                {expandedGroupId === group.id ? "Ocultar peticiones" : "Ver peticiones del grupo"}
              </button>

              {expandedGroupId === group.id && (
                <div className="mt-6 space-y-4">
                  {(groupPrayers[group.id] || []).length === 0 ? (
                    <p className="text-sm text-base-content/50 italic">
                      Aún no hay peticiones en este círculo.
                    </p>
                  ) : (
                    groupPrayers[group.id].map((prayer) => (
                      <div
                        key={prayer.id}
                        className="rounded-2xl p-5 border border-secondary/15 bg-secondary/5"
                      >
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <span className="text-xs font-bold text-secondary uppercase">
                            {prayer.category}
                          </span>
                          <span className="text-xs text-base-content/40">
                            {new Date(prayer.createdAt).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                        <p className="font-display italic text-base-content/85 mb-4">
                          &ldquo;{prayer.text}&rdquo;
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-base-content/60">por {prayer.userName}</span>
                          <button
                            type="button"
                            onClick={() => handleAmen(group.id, prayer.id)}
                            className="btn btn-xs btn-secondary rounded-full gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">favorite</span>
                            Amén · {prayer.prayersCount || 0}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function PrivateGroupsPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className="flex justify-center py-24">
            <span className="loading loading-spinner loading-lg text-primary" />
          </main>
        }
      >
        <PrivateGroupsContent />
      </Suspense>
      <Footer />
    </>
  );
}
